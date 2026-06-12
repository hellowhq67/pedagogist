-- 1) Storage: owner-only read for practice-recordings
DROP POLICY IF EXISTS "Authenticated can read practice recordings" ON storage.objects;

CREATE POLICY "Users read own practice recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'practice-recordings'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 2) speaking_attempts: remove client write access; only service role may write
DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.speaking_attempts;
DROP POLICY IF EXISTS "Users can delete their own attempts" ON public.speaking_attempts;

REVOKE INSERT, UPDATE, DELETE ON public.speaking_attempts FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.speaking_attempts FROM anon;
GRANT SELECT ON public.speaking_attempts TO authenticated;
GRANT ALL ON public.speaking_attempts TO service_role;