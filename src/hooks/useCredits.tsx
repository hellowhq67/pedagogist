import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface CreditsContextValue {
  credits: number;
  tier: string;
  loading: boolean;
  refresh: () => Promise<void>;
  optimisticallySpendOne: () => void;
}

const FREE_DAILY_CREDITS = 10;
const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [credits, setCredits] = useState(0);
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setTier("free");
      setCredits(FREE_DAILY_CREDITS);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("credits_remaining, tier")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error) {
      setTier(data?.tier ?? "free");
      setCredits(data?.credits_remaining ?? FREE_DAILY_CREDITS);
    }
    setLoading(false);
  }, [authLoading, user]);

  const optimisticallySpendOne = useCallback(() => {
    setCredits((current) => Math.max(0, current - 1));
  }, []);

  useEffect(() => { void fetchCredits(); }, [fetchCredits]);

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
            if (subscription.tier) setTier(subscription.tier);
            if (subscription.credits_remaining != null) setCredits(subscription.credits_remaining);
          }
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  return (
    <CreditsContext.Provider value={{ credits, tier, loading, refresh: fetchCredits, optimisticallySpendOne }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) throw new Error("useCredits must be used within a CreditsProvider");
  return context;
}
