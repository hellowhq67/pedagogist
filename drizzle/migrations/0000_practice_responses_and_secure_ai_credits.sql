CREATE TABLE public.practice_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id text NOT NULL,
  section text NOT NULL CHECK (section IN ('speaking', 'writing')),
  test_type text NOT NULL,
  response_text text NOT NULL,
  audio_path text,
  duration_seconds integer,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'scored')),
  score jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.practice_responses TO authenticated;
GRANT ALL ON public.practice_responses TO service_role;
ALTER TABLE public.practice_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own practice responses" ON public.practice_responses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own practice responses" ON public.practice_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.consume_ai_score_credit(p_user_id uuid)
RETURNS TABLE(ok boolean, remaining integer, tier text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cur integer;
  v_tier text;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User required';
  END IF;

  SELECT s.credits_remaining, s.tier::text
    INTO v_cur, v_tier
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.subscriptions (user_id, tier, credits_remaining)
    VALUES (p_user_id, 'free', 10)
    ON CONFLICT (user_id) DO NOTHING;
    SELECT s.credits_remaining, s.tier::text
      INTO v_cur, v_tier
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
    FOR UPDATE;
  END IF;

  IF COALESCE(v_cur, 0) <= 0 THEN
    RETURN QUERY SELECT false, 0, COALESCE(v_tier, 'free');
    RETURN;
  END IF;

  UPDATE public.subscriptions s
    SET credits_remaining = v_cur - 1, updated_at = now()
  WHERE s.user_id = p_user_id;

  RETURN QUERY SELECT true, v_cur - 1, COALESCE(v_tier, 'free');
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_ai_score_credit(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining integer;
BEGIN
  UPDATE public.subscriptions s
    SET credits_remaining = s.credits_remaining + 1, updated_at = now()
  WHERE s.user_id = p_user_id
  RETURNING s.credits_remaining INTO v_remaining;
  RETURN v_remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_score_credit(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_score_credit(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.restore_ai_score_credit(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_ai_score_credit(uuid) TO service_role;