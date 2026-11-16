CREATE TABLE IF NOT EXISTS public.practice_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  section text NOT NULL CHECK (section IN ('speaking', 'writing')),
  test_type text NOT NULL,
  response_text text NOT NULL,
  audio_path text,
  duration_seconds integer,
  status text NOT NULL DEFAULT 'submitted',
  score jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.practice_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_responses DROP CONSTRAINT IF EXISTS practice_responses_status_check;
ALTER TABLE public.practice_responses
  ADD CONSTRAINT practice_responses_status_check CHECK (status IN ('submitted', 'scoring', 'scored'));

GRANT SELECT, INSERT ON public.practice_responses TO authenticated;
GRANT ALL ON public.practice_responses TO service_role;

DROP POLICY IF EXISTS "Users read own practice responses" ON public.practice_responses;
CREATE POLICY "Users read own practice responses"
  ON public.practice_responses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own practice responses" ON public.practice_responses;
CREATE POLICY "Users insert own practice responses"
  ON public.practice_responses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS practice_responses_user_created_idx
  ON public.practice_responses (user_id, created_at DESC);

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

REVOKE ALL ON FUNCTION public.consume_ai_score_credit(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_score_credit(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.begin_ai_score_request(p_user_id uuid, p_response_id uuid)
RETURNS TABLE(ok boolean, remaining integer, tier text, already_scored boolean, saved_score jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_score jsonb;
  v_remaining integer;
  v_tier text;
  v_ok boolean;
BEGIN
  IF p_user_id IS NULL OR p_response_id IS NULL THEN
    RAISE EXCEPTION 'User and response are required';
  END IF;

  SELECT pr.status, pr.score
    INTO v_status, v_score
  FROM public.practice_responses pr
  WHERE pr.id = p_response_id AND pr.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'free'::text, false, NULL::jsonb;
    RETURN;
  END IF;

  SELECT s.credits_remaining, s.tier::text
    INTO v_remaining, v_tier
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.subscriptions (user_id, tier, credits_remaining)
    VALUES (p_user_id, 'free', 10)
    ON CONFLICT (user_id) DO NOTHING;
    SELECT s.credits_remaining, s.tier::text
      INTO v_remaining, v_tier
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
    FOR UPDATE;
  END IF;

  IF v_status = 'scored' THEN
    RETURN QUERY SELECT true, COALESCE(v_remaining, 0), COALESCE(v_tier, 'free'), true, v_score;
    RETURN;
  END IF;

  IF v_status <> 'submitted' OR COALESCE(v_remaining, 0) <= 0 THEN
    RETURN QUERY SELECT false, COALESCE(v_remaining, 0), COALESCE(v_tier, 'free'), false, NULL::jsonb;
    RETURN;
  END IF;

  SELECT credit.ok, credit.remaining, credit.tier
    INTO v_ok, v_remaining, v_tier
  FROM public.consume_ai_score_credit(p_user_id) AS credit;

  IF NOT COALESCE(v_ok, false) THEN
    RETURN QUERY SELECT false, COALESCE(v_remaining, 0), COALESCE(v_tier, 'free'), false, NULL::jsonb;
    RETURN;
  END IF;

  UPDATE public.practice_responses
    SET status = 'scoring'
  WHERE id = p_response_id AND user_id = p_user_id;

  RETURN QUERY SELECT true, v_remaining, COALESCE(v_tier, 'free'), false, NULL::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_ai_score_request(
  p_user_id uuid,
  p_response_id uuid,
  p_score jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.practice_responses
    SET status = 'scored', score = p_score
  WHERE id = p_response_id AND user_id = p_user_id AND status = 'scoring';
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_ai_score_request(p_user_id uuid, p_response_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining integer;
BEGIN
  UPDATE public.practice_responses
    SET status = 'submitted'
  WHERE id = p_response_id AND user_id = p_user_id AND status = 'scoring';

  IF NOT FOUND THEN
    SELECT s.credits_remaining INTO v_remaining
    FROM public.subscriptions s WHERE s.user_id = p_user_id;
    RETURN v_remaining;
  END IF;

  UPDATE public.subscriptions
    SET credits_remaining = credits_remaining + 1,
        updated_at = now()
  WHERE user_id = p_user_id
  RETURNING credits_remaining INTO v_remaining;

  RETURN v_remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.begin_ai_score_request(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_ai_score_request(uuid, uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_ai_score_request(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.begin_ai_score_request(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_ai_score_request(uuid, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_ai_score_request(uuid, uuid) TO service_role;
