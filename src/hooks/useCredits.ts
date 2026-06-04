import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [tier, setTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) { setLoading(false); return; }
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
        (payload: any) => {
          if (payload.new) {
            setCredits(payload.new.credits_remaining);
            setTier(payload.new.tier);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  /** Atomically consume 1 credit on the server. Returns true if allowed. */
  const consume = useCallback(async (): Promise<boolean> => {
    const { data, error } = await supabase.rpc("consume_scoring_credit");
    if (error) {
      toast.error("Could not check credit balance");
      return false;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.ok) {
      toast.error("Out of scoring credits — upgrade to continue");
      setCredits(0);
      return false;
    }
    setCredits(row.remaining);
    return true;
  }, []);

  return { credits: credits ?? 0, tier, loading, consume, refresh: fetchCredits };
}
