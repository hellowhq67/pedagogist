import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScoreResult, TestType } from "@/lib/scoring";

export interface SpeakingAttempt {
  id: string;
  question_id: string;
  test_type: string;
  spoken_text: string | null;
  overall_score: number;
  content_score: number;
  fluency_score: number;
  pronunciation_score: number;
  feedback: string[];
  detailed_analysis: {
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
  duration_seconds: number | null;
  created_at: string;
}

interface UseUserHistoryReturn {
  attempts: SpeakingAttempt[];
  isLoading: boolean;
  error: string | null;
  saveAttempt: (params: SaveAttemptParams) => Promise<void>;
  getAttemptsByType: (testType: TestType) => SpeakingAttempt[];
  getAverageScore: () => number;
  getRecentAttempts: (limit?: number) => SpeakingAttempt[];
  refetch: () => Promise<void>;
}

interface SaveAttemptParams {
  questionId: string;
  testType: TestType;
  spokenText: string;
  score: ScoreResult;
  durationSeconds?: number;
}

export function useUserHistory(): UseUserHistoryReturn {
  const [attempts, setAttempts] = useState<SpeakingAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAttempts([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("speaking_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match our interface
      const transformedData: SpeakingAttempt[] = (data || []).map((item) => ({
        id: item.id,
        question_id: item.question_id,
        test_type: item.test_type,
        spoken_text: item.spoken_text,
        overall_score: item.overall_score,
        content_score: item.content_score,
        fluency_score: item.fluency_score,
        pronunciation_score: item.pronunciation_score,
        feedback: (item.feedback as string[]) || [],
        detailed_analysis: (item.detailed_analysis as {
          strengths: string[];
          improvements: string[];
          tips: string[];
        }) || { strengths: [], improvements: [], tips: [] },
        duration_seconds: item.duration_seconds,
        created_at: item.created_at,
      }));

      setAttempts(transformedData);
    } catch (err) {
      console.error("Error fetching attempts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch history");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const saveAttempt = useCallback(async ({
    questionId,
    testType,
    spokenText,
    score,
    durationSeconds,
  }: SaveAttemptParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user logged in, skipping save");
        return;
      }

      const { error: insertError } = await supabase
        .from("speaking_attempts")
        .insert({
          user_id: user.id,
          question_id: questionId,
          test_type: testType,
          spoken_text: spokenText,
          overall_score: Math.round(score.overallScore),
          content_score: Math.round(score.content),
          fluency_score: Math.round(score.fluency),
          pronunciation_score: Math.round(score.pronunciation),
          feedback: score.feedback,
          detailed_analysis: score.detailedAnalysis,
          duration_seconds: durationSeconds,
        });

      if (insertError) {
        throw insertError;
      }

      // Refetch to update the list
      await fetchAttempts();
    } catch (err) {
      console.error("Error saving attempt:", err);
    }
  }, [fetchAttempts]);

  const getAttemptsByType = useCallback((testType: TestType) => {
    return attempts.filter((a) => a.test_type === testType);
  }, [attempts]);

  const getAverageScore = useCallback(() => {
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((sum, a) => sum + a.overall_score, 0);
    return Math.round(total / attempts.length);
  }, [attempts]);

  const getRecentAttempts = useCallback((limit = 10) => {
    return attempts.slice(0, limit);
  }, [attempts]);

  return {
    attempts,
    isLoading,
    error,
    saveAttempt,
    getAttemptsByType,
    getAverageScore,
    getRecentAttempts,
    refetch: fetchAttempts,
  };
}
