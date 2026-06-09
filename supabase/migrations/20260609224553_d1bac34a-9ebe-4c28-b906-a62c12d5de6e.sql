
DROP POLICY IF EXISTS "Users can insert own scores" ON public.scores;
DROP POLICY IF EXISTS "Users insert own scores" ON public.scores;
DROP POLICY IF EXISTS "Users can create their own scores" ON public.scores;
DROP POLICY IF EXISTS "Users insert scores for own submissions" ON public.scores;

REVOKE INSERT, UPDATE, DELETE ON public.scores FROM authenticated, anon;
