import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UserProgressRow {
  skill_type: string;
  question_type?: string;
  average_score: number | null;
  best_score: number | null;
  attempt_count: number;
  total_time_spent_ms: number | null;
}

interface SpeakingAttemptRow {
  created_at: string;
  overall_score: number;
  pronunciation_score: number;
  fluency_score: number;
  content_score: number;
  test_type: string;
}

interface SubscriptionRow {
  tier: string;
  credits_remaining: number;
  daily_credits_used: number;
}

interface WeekDay {
  day: string;
  date: string;
  speaking: number;
  writing: number;
  reading: number;
  listening: number;
}

interface SkillPoint {
  skill: string;
  score: number;
  fullMark: number;
}

interface ActivityPoint {
  name: string;
  value: number;
  fill: string;
}

interface Stats {
  questionsDone: number;
  practiceHours: number;
  streakDays: number;
  averageScore: number;
}

interface UserDataContextValue {
  loading: boolean;
  userProgress: UserProgressRow[];
  subscription: SubscriptionRow | null;
  weeklyProgress: WeekDay[];
  skillsRadar: SkillPoint[];
  activity: ActivityPoint[];
  stats: Stats;
  refresh: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextValue | undefined>(undefined);

const SKILL_COLORS: Record<string, string> = {
  Speaking: "hsl(var(--primary))",
  Writing: "hsl(var(--accent))",
  Reading: "#10b981",
  Listening: "#3b82f6",
};

const dayLabel = (d: Date) =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];

function buildEmptyWeek(): WeekDay[] {
  const week: WeekDay[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    week.push({
      day: dayLabel(d),
      date: d.toISOString().split("T")[0],
      speaking: 0,
      writing: 0,
      reading: 0,
      listening: 0,
    });
  }
  return week;
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = Array.from(new Set(dates)).sort((a, b) => (a < b ? 1 : -1));
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < unique.length; i++) {
    const check = new Date(today);
    check.setDate(today.getDate() - i);
    if (unique[i] === check.toISOString().split("T")[0]) streak++;
    else break;
  }
  return streak;
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgressRow[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeekDay[]>(buildEmptyWeek());
  const [skillsRadar, setSkillsRadar] = useState<SkillPoint[]>([]);
  const [activity, setActivity] = useState<ActivityPoint[]>([]);
  const [stats, setStats] = useState<Stats>({
    questionsDone: 0,
    practiceHours: 0,
    streakDays: 0,
    averageScore: 0,
  });

  const fetchAll = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const [progressRes, subRes, attemptsRes] = await Promise.all([
        supabase.from("user_progress").select("*").eq("user_id", user.id),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("speaking_attempts")
          .select("created_at, overall_score, pronunciation_score, fluency_score, content_score, test_type")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true }),
      ]);

      const progress = (progressRes.data || []) as UserProgressRow[];
      setUserProgress(progress);
      setSubscription((subRes.data as SubscriptionRow) || null);

      const attempts = (attemptsRes.data || []) as SpeakingAttemptRow[];

      // Weekly progress — aggregate average score per skill per day
      const week = buildEmptyWeek();
      const dayMap: Record<string, { speaking: number[]; writing: number[]; reading: number[]; listening: number[] }> = {};
      week.forEach((w) => {
        dayMap[w.date] = { speaking: [], writing: [], reading: [], listening: [] };
      });
      attempts.forEach((a) => {
        const d = a.created_at.split("T")[0];
        if (dayMap[d]) dayMap[d].speaking.push(a.overall_score);
      });
      const avg = (arr: number[]) =>
        arr.length ? Math.round(arr.reduce((s, n) => s + n, 0) / arr.length) : 0;
      const enrichedWeek = week.map((w) => ({
        ...w,
        speaking: avg(dayMap[w.date].speaking),
        writing: avg(dayMap[w.date].writing),
        reading: avg(dayMap[w.date].reading),
        listening: avg(dayMap[w.date].listening),
      }));
      setWeeklyProgress(enrichedWeek);

      // Skills radar — average per skill from user_progress
      const skillAverage = (skill: string) => {
        const rows = progress.filter((p) => p.skill_type === skill);
        if (!rows.length) return 0;
        return Math.round(
          rows.reduce((s, r) => s + (r.average_score || 0), 0) / rows.length
        );
      };
      setSkillsRadar([
        { skill: "Speaking", score: skillAverage("speaking"), fullMark: 90 },
        { skill: "Writing", score: skillAverage("writing"), fullMark: 90 },
        { skill: "Reading", score: skillAverage("reading"), fullMark: 90 },
        { skill: "Listening", score: skillAverage("listening"), fullMark: 90 },
      ]);

      // Activity — attempts per skill
      const attemptsForSkill = (skill: string) =>
        progress
          .filter((p) => p.skill_type === skill)
          .reduce((s, p) => s + (p.attempt_count || 0), 0);
      setActivity([
        { name: "Speaking", value: attemptsForSkill("speaking"), fill: SKILL_COLORS.Speaking },
        { name: "Writing", value: attemptsForSkill("writing"), fill: SKILL_COLORS.Writing },
        { name: "Reading", value: attemptsForSkill("reading"), fill: SKILL_COLORS.Reading },
        { name: "Listening", value: attemptsForSkill("listening"), fill: SKILL_COLORS.Listening },
      ]);

      // Stats
      const totalAttempts = progress.reduce((s, p) => s + (p.attempt_count || 0), 0);
      const totalMs = progress.reduce((s, p) => s + (p.total_time_spent_ms || 0), 0);
      const scoresOnly = progress.filter((p) => (p.average_score || 0) > 0);
      const overallAvg = scoresOnly.length
        ? Math.round(
            scoresOnly.reduce((s, p) => s + (p.average_score || 0), 0) /
              scoresOnly.length
          )
        : 0;
      const attemptDates = attempts.map((a) => a.created_at.split("T")[0]);
      setStats({
        questionsDone: totalAttempts,
        practiceHours: Math.round(totalMs / 3600000),
        streakDays: computeStreak(attemptDates),
        averageScore: overallAvg,
      });
    } catch (err) {
      console.error("UserDataContext fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <UserDataContext.Provider
      value={{
        loading,
        userProgress,
        subscription,
        weeklyProgress,
        skillsRadar,
        activity,
        stats,
        refresh: fetchAll,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used inside UserDataProvider");
  return ctx;
}
