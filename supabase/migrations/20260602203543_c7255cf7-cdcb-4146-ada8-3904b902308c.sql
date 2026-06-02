
-- 1. Questions: restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can read questions" ON public.questions;
CREATE POLICY "Authenticated users can read questions"
  ON public.questions FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.questions FROM anon;

-- 2. Subscriptions: remove user write policies (server-side only)
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- 3. Daily scoring limits: remove user write policies
DROP POLICY IF EXISTS "Users can insert their own limits" ON public.daily_scoring_limits;
DROP POLICY IF EXISTS "Users can update their own limits" ON public.daily_scoring_limits;

-- Secure function for incrementing scoring attempts
CREATE OR REPLACE FUNCTION public.increment_scoring_attempt(p_daily_limit integer DEFAULT 5)
RETURNS TABLE(allowed boolean, attempt_count integer, remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_existing public.daily_scoring_limits%ROWTYPE;
  v_new_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_existing
  FROM public.daily_scoring_limits
  WHERE user_id = v_user_id AND scoring_date = v_today
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.daily_scoring_limits (user_id, scoring_date, attempt_count)
    VALUES (v_user_id, v_today, 1);
    RETURN QUERY SELECT true, 1, GREATEST(0, p_daily_limit - 1);
    RETURN;
  END IF;

  IF v_existing.attempt_count >= p_daily_limit THEN
    RETURN QUERY SELECT false, v_existing.attempt_count, 0;
    RETURN;
  END IF;

  v_new_count := v_existing.attempt_count + 1;
  UPDATE public.daily_scoring_limits
  SET attempt_count = v_new_count, updated_at = now()
  WHERE id = v_existing.id;

  RETURN QUERY SELECT true, v_new_count, GREATEST(0, p_daily_limit - v_new_count);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_scoring_attempt(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_scoring_attempt(integer) TO authenticated;

-- 4. Analytics snapshots: add owner write policies
CREATE POLICY "Users can insert own analytics"
  ON public.analytics_snapshots FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics"
  ON public.analytics_snapshots FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analytics"
  ON public.analytics_snapshots FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. User roles: explicit restrictive policy preventing non-admin writes
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update roles"
  ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete roles"
  ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
