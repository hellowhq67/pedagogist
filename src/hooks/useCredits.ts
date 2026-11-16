import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [tier, setTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(0);
      setTier("free");
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("credits_remaining, tier")
      .eq("user_id", user.id)
      .maybeSingle();
    setCredits(data?.credits_remaining ?? 0);
    setTier(data?.tier ?? "free");
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            const subscription = payload.new as { credits_remaining?: number; tier?: string };
            if (subscription.credits_remaining != null) setCredits(subscription.credits_remaining);
            if (subscription.tier) setTier(subscription.tier);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { credits: credits ?? 0, tier, loading, refresh: fetchCredits };
}
