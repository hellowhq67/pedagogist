import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const DAILY_LIMIT = 5;

interface UseScoringLimitReturn {
  remainingAttempts: number;
  isLoading: boolean;
  canScore: boolean;
  incrementUsage: () => Promise<boolean>;
  resetDate: string | null;
}

export function useScoringLimit(): UseScoringLimitReturn {
  const [remainingAttempts, setRemainingAttempts] = useState(DAILY_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  const [resetDate, setResetDate] = useState<string | null>(null);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const fetchUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Not logged in - still allow limited usage stored in localStorage
        const localData = localStorage.getItem('scoring_limit');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed.date === getTodayDate()) {
            setRemainingAttempts(DAILY_LIMIT - parsed.count);
          } else {
            localStorage.setItem('scoring_limit', JSON.stringify({ date: getTodayDate(), count: 0 }));
            setRemainingAttempts(DAILY_LIMIT);
          }
        } else {
          setRemainingAttempts(DAILY_LIMIT);
        }
        setResetDate(getTodayDate());
        setIsLoading(false);
        return;
      }

      const today = getTodayDate();
      setResetDate(today);

      const { data, error } = await supabase
        .from("daily_scoring_limits")
        .select("*")
        .eq("user_id", user.id)
        .eq("scoring_date", today)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching scoring limit:", error);
        setRemainingAttempts(DAILY_LIMIT);
        return;
      }

      if (data) {
        setRemainingAttempts(Math.max(0, DAILY_LIMIT - data.attempt_count));
      } else {
        setRemainingAttempts(DAILY_LIMIT);
      }
    } catch (err) {
      console.error("Error in fetchUsage:", err);
      setRemainingAttempts(DAILY_LIMIT);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const incrementUsage = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Handle local storage for non-logged-in users
        const localData = localStorage.getItem('scoring_limit');
        let currentCount = 0;
        
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed.date === getTodayDate()) {
            currentCount = parsed.count;
          }
        }
        
        if (currentCount >= DAILY_LIMIT) {
          return false;
        }
        
        localStorage.setItem('scoring_limit', JSON.stringify({ 
          date: getTodayDate(), 
          count: currentCount + 1 
        }));
        setRemainingAttempts(DAILY_LIMIT - currentCount - 1);
        return true;
      }

      const today = getTodayDate();

      // Try to get existing record
      const { data: existing } = await supabase
        .from("daily_scoring_limits")
        .select("*")
        .eq("user_id", user.id)
        .eq("scoring_date", today)
        .single();

      if (existing) {
        if (existing.attempt_count >= DAILY_LIMIT) {
          return false;
        }

        const { error: updateError } = await supabase
          .from("daily_scoring_limits")
          .update({ 
            attempt_count: existing.attempt_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error updating scoring limit:", updateError);
          return false;
        }

        setRemainingAttempts(Math.max(0, DAILY_LIMIT - existing.attempt_count - 1));
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from("daily_scoring_limits")
          .insert({
            user_id: user.id,
            scoring_date: today,
            attempt_count: 1
          });

        if (insertError) {
          console.error("Error inserting scoring limit:", insertError);
          return false;
        }

        setRemainingAttempts(DAILY_LIMIT - 1);
      }

      return true;
    } catch (err) {
      console.error("Error incrementing usage:", err);
      return false;
    }
  }, []);

  return {
    remainingAttempts,
    isLoading,
    canScore: remainingAttempts > 0,
    incrementUsage,
    resetDate
  };
}
