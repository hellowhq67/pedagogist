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

      const [progressRes, subRes, attemptsRes, allAttemptsRes] = await Promise.all([
        supabase.from("user_progress").select("*").eq("user_id", user.id),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("speaking_attempts")
          .select("created_at, overall_score, pronunciation_score, fluency_score, content_score, test_type")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true }),
        supabase
          .from("speaking_attempts")
          .select("created_at, overall_score, duration_seconds")
          .eq("user_id", user.id),
      ]);

      const progress = (progressRes.data || []) as UserProgressRow[];
      setUserProgress(progress);
      setSubscription((subRes.data as SubscriptionRow) || null);

      const attempts = (attemptsRes.data || []) as SpeakingAttemptRow[];
      const allAttempts = (allAttemptsRes.data || []) as Array<{ created_at: string; overall_score: number; duration_seconds: number | null }>;

      // Weekly progress
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

      // Skills radar
      const speakingAvg = allAttempts.length
        ? Math.round(allAttempts.reduce((s, a) => s + (a.overall_score || 0), 0) / allAttempts.length)
        : 0;
      setSkillsRadar([
        { skill: "Speaking", score: speakingAvg, fullMark: 90 },
        { skill: "Writing", score: 0, fullMark: 90 },
        { skill: "Reading", score: 0, fullMark: 90 },
        { skill: "Listening", score: 0, fullMark: 90 },
      ]);

      setActivity([
        { name: "Speaking", value: allAttempts.length, fill: SKILL_COLORS.Speaking },
        { name: "Writing", value: 0, fill: SKILL_COLORS.Writing },
        { name: "Reading", value: 0, fill: SKILL_COLORS.Reading },
        { name: "Listening", value: 0, fill: SKILL_COLORS.Listening },
      ]);

      // Stats — derive from speaking_attempts directly so dashboard reflects activity
      const totalAttempts = allAttempts.length;
      const totalSeconds = allAttempts.reduce((s, a) => s + (a.duration_seconds || 0), 0);
      const allDates = allAttempts.map((a) => a.created_at.split("T")[0]);
      setStats({
        questionsDone: totalAttempts,
        practiceHours: Math.round((totalSeconds / 3600) * 10) / 10,
        streakDays: computeStreak(allDates),
        averageScore: speakingAvg,
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
