import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for scoring credits — reads from `subscriptions.credits_remaining`
 * so the dashboard header and the in-test counter never disagree.
 * Decrement happens server-side when a score is finalised (or locally as a fallback).
 */
interface UseScoringLimitReturn {
  remainingAttempts: number;
  isLoading: boolean;
  canScore: boolean;
  incrementUsage: () => Promise<boolean>;
  resetDate: string | null;
}

export function useScoringLimit(): UseScoringLimitReturn {
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRemainingAttempts(0);
        return;
      }
      const { data } = await supabase
        .from("subscriptions")
        .select("credits_remaining")
        .eq("user_id", user.id)
        .maybeSingle();
      setRemainingAttempts(data?.credits_remaining ?? 0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  // Realtime — keep test page counter in sync with header
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = supabase
        .channel(`scoring-credits-${user.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            if (payload.new?.credits_remaining != null) {
              setRemainingAttempts(payload.new.credits_remaining);
            }
          }
        )
        .subscribe();
    });
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const incrementUsage = useCallback(async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Optimistic
    const { data: cur } = await supabase
      .from("subscriptions")
      .select("credits_remaining")
      .eq("user_id", user.id)
      .maybeSingle();
    const current = cur?.credits_remaining ?? 0;
    if (current <= 0) {
      setRemainingAttempts(0);
      return false;
    }
    const next = current - 1;
    const { error } = await supabase
      .from("subscriptions")
      .update({ credits_remaining: next })
      .eq("user_id", user.id);
    if (error) return false;
    setRemainingAttempts(next);
    return true;
  }, []);

  return {
    remainingAttempts,
    isLoading,
    canScore: remainingAttempts > 0,
    incrementUsage,
    resetDate: null,
  };
}
