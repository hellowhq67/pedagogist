-- Fix use_scoring_credit() to validate caller owns the credits
CREATE OR REPLACE FUNCTION public.use_scoring_credit(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_credits_remaining INTEGER;
  v_daily_used INTEGER;
  v_tier subscription_tier;
  v_daily_limit INTEGER;
BEGIN
  -- CRITICAL: Validate caller can only use their own credits
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot use credits for another user';
  END IF;

  -- Reset daily credits if needed
  PERFORM public.reset_daily_credits();
  
  -- Get current subscription status
  SELECT tier, credits_remaining, daily_credits_used
  INTO v_tier, v_credits_remaining, v_daily_used
  FROM public.subscriptions
  WHERE user_id = p_user_id;
  
  -- Determine daily limit based on tier
  v_daily_limit := CASE v_tier
    WHEN 'free' THEN 10
    WHEN 'basic' THEN 50
    WHEN 'premium' THEN 200
    WHEN 'enterprise' THEN 1000
    ELSE 10
  END;
  
  -- Check if user can use credit
  IF v_daily_used >= v_daily_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Use credit
  UPDATE public.subscriptions
  SET 
    daily_credits_used = daily_credits_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$function$;

-- Revoke direct execute from public on reset_daily_credits (should be service-role only)
REVOKE EXECUTE ON FUNCTION public.reset_daily_credits() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reset_daily_credits() FROM anon;
REVOKE EXECUTE ON FUNCTION public.reset_daily_credits() FROM authenticated;