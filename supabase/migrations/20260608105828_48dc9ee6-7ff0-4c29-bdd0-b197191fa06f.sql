DROP POLICY IF EXISTS "Users can insert their own scores" ON public.scores;
DROP POLICY IF EXISTS "Users insert own scores" ON public.scores;
DROP POLICY IF EXISTS "Users can create their own scores" ON public.scores;

CREATE POLICY "Users insert scores for own submissions"
ON public.scores
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_id AND s.user_id = auth.uid()
  )
);