
-- Storage policies for practice-recordings bucket (private)
DROP POLICY IF EXISTS "Users upload own practice recordings" ON storage.objects;
CREATE POLICY "Users upload own practice recordings"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'practice-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated can read practice recordings" ON storage.objects;
CREATE POLICY "Authenticated can read practice recordings"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'practice-recordings');

DROP POLICY IF EXISTS "Users delete own practice recordings" ON storage.objects;
CREATE POLICY "Users delete own practice recordings"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'practice-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Atomic credit consumption (server-side rate limiting)
CREATE OR REPLACE FUNCTION public.consume_practice_credit()
RETURNS TABLE(ok boolean, remaining integer, tier text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_cur integer;
  v_tier text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT credits_remaining, tier::text
    INTO v_cur, v_tier
  FROM public.subscriptions
  WHERE user_id = v_uid
  FOR UPDATE;

  IF v_cur IS NULL THEN
    INSERT INTO public.subscriptions (user_id, tier, credits_remaining)
    VALUES (v_uid, 'free', 10)
    ON CONFLICT (user_id) DO NOTHING;
    v_cur := 10;
    v_tier := 'free';
  END IF;

  IF v_cur <= 0 THEN
    RETURN QUERY SELECT false, 0, v_tier;
    RETURN;
  END IF;

  UPDATE public.subscriptions
    SET credits_remaining = credits_remaining - 1,
        updated_at = now()
  WHERE user_id = v_uid;

  RETURN QUERY SELECT true, v_cur - 1, v_tier;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_practice_credit() TO authenticated;
