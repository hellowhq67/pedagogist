import { useCredits } from "@/hooks/useCredits";

interface UseScoringLimitReturn {
  remainingAttempts: number;
  isLoading: boolean;
  canScore: boolean;
  refresh: () => Promise<void>;
}

export function useScoringLimit(): UseScoringLimitReturn {
  const { credits, loading, refresh } = useCredits();
  return {
    remainingAttempts: credits,
    isLoading: loading,
    canScore: credits > 0,
    refresh,
  };
}
