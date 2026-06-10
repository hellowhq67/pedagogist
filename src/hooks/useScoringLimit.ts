import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for scoring credits — reads `subscriptions.credits_remaining`
 * and decrements via the server-side `consume_practice_credit` RPC (atomic, rate-limited).
 */
interface UseScoringLimitReturn {
  remainingAttempts: number;
  isLoading: boolean;
  canScore: boolean;
  /** Atomically consume one credit. Returns true if the attempt is allowed. */
  incrementUsage: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useScoringLimit(): UseScoringLimitReturn {
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRemainingAttempts(0); return; }
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
    const { data, error } = await (supabase as any).rpc("consume_practice_credit");
    if (error) return false;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.ok) {
      setRemainingAttempts(0);
      return false;
    }
    setRemainingAttempts(row.remaining ?? 0);
    return true;
  }, []);

  return {
    remainingAttempts,
    isLoading,
    canScore: remainingAttempts > 0,
    incrementUsage,
    refresh: fetchCredits,
  };
}
