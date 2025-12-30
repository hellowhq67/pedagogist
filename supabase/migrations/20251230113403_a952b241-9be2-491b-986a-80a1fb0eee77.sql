-- Fix RLS on questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read questions
CREATE POLICY "Anyone can read questions"
  ON public.questions FOR SELECT USING (true);

-- Fix function search path warnings
CREATE OR REPLACE FUNCTION public.get_max_score_for_question_type(p_question_type question_type)
RETURNS REAL AS $$
BEGIN
  RETURN CASE p_question_type
    WHEN 'read_aloud' THEN 15
    WHEN 'repeat_sentence' THEN 13
    WHEN 'retell_lecture' THEN 16
    WHEN 'answer_short_question' THEN 1
    WHEN 'summarise_group_discussion' THEN 16
    WHEN 'respond_to_situation' THEN 13
    WHEN 'summarize_written_text' THEN 12
    WHEN 'write_essay' THEN 26
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.should_have_human_review(p_question_type question_type)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_question_type IN (
    'write_essay',
    'summarize_written_text',
    'summarize_spoken_text',
    'retell_lecture',
    'summarise_group_discussion',
    'respond_to_situation',
    'read_aloud'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;