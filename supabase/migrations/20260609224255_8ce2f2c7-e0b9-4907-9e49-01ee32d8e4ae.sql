
-- Discussion threads attached to practice questions (frontend question IDs are text)
CREATE TABLE public.question_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_discussions TO authenticated;
GRANT ALL ON public.question_discussions TO service_role;

ALTER TABLE public.question_discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed-in can read discussions"
  ON public.question_discussions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users insert their own comments"
  ON public.question_discussions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own comments"
  ON public.question_discussions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own comments"
  ON public.question_discussions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_question_discussions_question ON public.question_discussions(question_id, created_at DESC);

CREATE TRIGGER update_question_discussions_updated_at
  BEFORE UPDATE ON public.question_discussions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Let other signed-in users read each other's speaking_attempts so the "Board" tab works.
-- Existing policies still restrict insert/update/delete to owners.
DROP POLICY IF EXISTS "Anyone signed-in can read speaking attempts" ON public.speaking_attempts;
CREATE POLICY "Anyone signed-in can read speaking attempts"
  ON public.speaking_attempts FOR SELECT
  TO authenticated USING (true);

-- Allow reading display_name from any profile (already typically public for usernames)
DROP POLICY IF EXISTS "Profiles are readable to authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable to authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated USING (true);
