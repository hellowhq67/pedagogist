
-- Remove broad SELECT policies introduced for leaderboard
DROP POLICY IF EXISTS "Anyone signed-in can read speaking attempts" ON public.speaking_attempts;
DROP POLICY IF EXISTS "Profiles are readable to authenticated users" ON public.profiles;

-- Leaderboard-safe function: only exposes display_name + score-related fields,
-- never spoken_text, detailed_analysis, or feedback.
CREATE OR REPLACE FUNCTION public.get_question_leaderboard(p_question_id text, p_limit integer DEFAULT 20)
RETURNS TABLE (
  attempt_id uuid,
  user_id uuid,
  display_name text,
  audio_url text,
  duration_seconds integer,
  overall_score integer,
  test_type text,
  created_at timestamptz,
  is_me boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sa.id,
    sa.user_id,
    COALESCE(p.display_name, 'Student'),
    sa.audio_url,
    sa.duration_seconds,
    sa.overall_score,
    sa.test_type,
    sa.created_at,
    (sa.user_id = auth.uid())
  FROM public.speaking_attempts sa
  LEFT JOIN public.profiles p ON p.user_id = sa.user_id
  WHERE sa.question_id = p_question_id
    AND auth.uid() IS NOT NULL
  ORDER BY sa.overall_score DESC NULLS LAST, sa.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 50));
$$;

REVOKE ALL ON FUNCTION public.get_question_leaderboard(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_question_leaderboard(text, integer) TO authenticated;

-- Companion function for the Discussion tab so we can show comment authors' names
-- without giving the client SELECT access to the entire profiles table.
CREATE OR REPLACE FUNCTION public.get_question_discussions(p_question_id text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  body text,
  created_at timestamptz,
  is_me boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    d.id,
    d.user_id,
    COALESCE(p.display_name, 'Student'),
    d.body,
    d.created_at,
    (d.user_id = auth.uid())
  FROM public.question_discussions d
  LEFT JOIN public.profiles p ON p.user_id = d.user_id
  WHERE d.question_id = p_question_id
    AND auth.uid() IS NOT NULL
  ORDER BY d.created_at DESC
  LIMIT 200;
$$;

REVOKE ALL ON FUNCTION public.get_question_discussions(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_question_discussions(text) TO authenticated;
