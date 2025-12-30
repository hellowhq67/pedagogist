-- ============================================================================
-- PTE ACADEMIC SCORING SYSTEM - COMPREHENSIVE DATABASE SCHEMA
-- PedagogistsPTE Platform
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE question_type AS ENUM (
  -- Speaking (7 types)
  'read_aloud',
  'repeat_sentence',
  'retell_lecture',
  'answer_short_question',
  'summarise_group_discussion',
  'respond_to_situation',
  -- Writing (2 types)
  'summarize_written_text',
  'write_essay',
  -- Reading (5 types)
  'mc_single_reading',
  'mc_multiple_reading',
  'reorder_paragraphs',
  'fill_blanks_dropdown',
  'fill_blanks_drag',
  -- Listening (8 types)
  'summarize_spoken_text',
  'mc_multiple_listening',
  'mc_single_listening',
  'fill_blanks_listening',
  'highlight_correct_summary',
  'select_missing_word',
  'highlight_incorrect_words',
  'write_from_dictation'
);

CREATE TYPE scoring_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'needs_review',
  'human_review_pending'
);

CREATE TYPE subscription_tier AS ENUM (
  'free',
  'basic',
  'premium',
  'enterprise'
);

CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

-- ============================================================================
-- USER ROLES TABLE (Separate from profiles for security)
-- ============================================================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier DEFAULT 'free',
  credits_remaining INTEGER DEFAULT 10,
  daily_credits_used INTEGER DEFAULT 0,
  daily_credits_reset_at TIMESTAMPTZ DEFAULT NOW(),
  polar_subscription_id TEXT,
  polar_customer_id TEXT,
  status TEXT DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_polar ON public.subscriptions(polar_subscription_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- EXAM GOALS TABLE
-- ============================================================================

CREATE TABLE public.exam_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_overall_score INTEGER CHECK (target_overall_score BETWEEN 10 AND 90),
  target_speaking_score INTEGER CHECK (target_speaking_score BETWEEN 10 AND 90),
  target_writing_score INTEGER CHECK (target_writing_score BETWEEN 10 AND 90),
  target_reading_score INTEGER CHECK (target_reading_score BETWEEN 10 AND 90),
  target_listening_score INTEGER CHECK (target_listening_score BETWEEN 10 AND 90),
  exam_date DATE NOT NULL,
  study_days_per_week INTEGER DEFAULT 5,
  hours_per_day DECIMAL(3,1) DEFAULT 2.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.exam_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exam goals"
  ON public.exam_goals FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STUDY SCHEDULE TABLE
-- ============================================================================

CREATE TABLE public.study_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  skill_type TEXT NOT NULL CHECK (skill_type IN ('speaking', 'writing', 'reading', 'listening')),
  question_types TEXT[] NOT NULL,
  target_questions INTEGER DEFAULT 10,
  completed_questions INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 30,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scheduled_date, skill_type)
);

CREATE INDEX idx_schedules_user_date ON public.study_schedules(user_id, scheduled_date);

ALTER TABLE public.study_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own schedules"
  ON public.study_schedules FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TEST SESSIONS TABLE
-- ============================================================================

CREATE TABLE public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('mock', 'practice', 'sectional')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  overall_score INTEGER CHECK (overall_score BETWEEN 10 AND 90),
  speaking_score INTEGER CHECK (speaking_score BETWEEN 10 AND 90),
  writing_score INTEGER CHECK (writing_score BETWEEN 10 AND 90),
  reading_score INTEGER CHECK (reading_score BETWEEN 10 AND 90),
  listening_score INTEGER CHECK (listening_score BETWEEN 10 AND 90),
  total_questions INTEGER DEFAULT 0,
  completed_questions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON public.test_sessions(user_id);
CREATE INDEX idx_sessions_completed ON public.test_sessions(completed_at) WHERE completed_at IS NOT NULL;

ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions"
  ON public.test_sessions FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- QUESTIONS TABLE
-- ============================================================================

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type question_type NOT NULL,
  prompt TEXT NOT NULL,
  reference_text TEXT,
  audio_url TEXT,
  image_url TEXT,
  situation_context TEXT,
  discussion_transcript JSONB,
  correct_answer JSONB,
  options JSONB,
  max_score REAL NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  is_human_reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_type ON public.questions(question_type);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);

-- ============================================================================
-- SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id),
  question_type question_type NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_response TEXT,
  audio_url TEXT,
  selected_options JSONB,
  ordered_items JSONB,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  processing_started_at TIMESTAMPTZ,
  duration_ms INTEGER
);

CREATE INDEX idx_submissions_session ON public.submissions(session_id);
CREATE INDEX idx_submissions_user ON public.submissions(user_id);
CREATE INDEX idx_submissions_question ON public.submissions(question_id);
CREATE INDEX idx_submissions_type ON public.submissions(question_type);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own submissions"
  ON public.submissions FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SCORES TABLE (Enhanced for hybrid scoring)
-- ============================================================================

CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score REAL NOT NULL,
  max_score REAL NOT NULL,
  percentage REAL GENERATED ALWAYS AS (
    CASE WHEN max_score > 0 THEN (total_score / max_score) * 100 ELSE 0 END
  ) STORED,
  trait_scores JSONB,
  skill_contributions JSONB,
  feedback JSONB,
  status scoring_status DEFAULT 'pending',
  model_version TEXT,
  scoring_latency_ms INTEGER,
  confidence_score REAL CHECK (confidence_score BETWEEN 0 AND 1),
  scored_at TIMESTAMPTZ,
  ai_score REAL,
  human_score REAL,
  scoring_method TEXT DEFAULT 'ai' CHECK (scoring_method IN ('ai', 'human', 'hybrid')),
  needs_review BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

CREATE INDEX idx_scores_submission ON public.scores(submission_id);
CREATE INDEX idx_scores_user ON public.scores(user_id);
CREATE INDEX idx_scores_status ON public.scores(status);
CREATE INDEX idx_scores_needs_review ON public.scores(needs_review) WHERE needs_review = true;
CREATE INDEX idx_scores_method ON public.scores(scoring_method);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scores"
  ON public.scores FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- USER PROGRESS TABLE
-- ============================================================================

CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_type TEXT NOT NULL CHECK (skill_type IN ('speaking', 'writing', 'reading', 'listening')),
  question_type question_type NOT NULL,
  average_score REAL,
  best_score REAL,
  attempt_count INTEGER DEFAULT 0,
  total_time_spent_ms BIGINT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_type, question_type)
);

CREATE INDEX idx_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_progress_skill ON public.user_progress(skill_type);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress"
  ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- ANALYTICS SNAPSHOTS TABLE (for progress charts)
-- ============================================================================

CREATE TABLE public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  overall_average REAL,
  speaking_average REAL,
  writing_average REAL,
  reading_average REAL,
  listening_average REAL,
  total_practice_minutes INTEGER DEFAULT 0,
  questions_attempted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_analytics_user_date ON public.analytics_snapshots(user_id, snapshot_date);

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON public.analytics_snapshots FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get max score by question type
CREATE OR REPLACE FUNCTION public.get_max_score_for_question_type(p_question_type question_type)
RETURNS REAL AS $$
BEGIN
  RETURN CASE p_question_type
    -- Speaking
    WHEN 'read_aloud' THEN 15
    WHEN 'repeat_sentence' THEN 13
    WHEN 'retell_lecture' THEN 16
    WHEN 'answer_short_question' THEN 1
    WHEN 'summarise_group_discussion' THEN 16
    WHEN 'respond_to_situation' THEN 13
    -- Writing
    WHEN 'summarize_written_text' THEN 12
    WHEN 'write_essay' THEN 26
    -- Reading
    WHEN 'mc_single_reading' THEN 1
    WHEN 'mc_multiple_reading' THEN 1
    WHEN 'reorder_paragraphs' THEN 4
    WHEN 'fill_blanks_dropdown' THEN 1
    WHEN 'fill_blanks_drag' THEN 1
    -- Listening
    WHEN 'summarize_spoken_text' THEN 12
    WHEN 'mc_multiple_listening' THEN 1
    WHEN 'mc_single_listening' THEN 1
    WHEN 'fill_blanks_listening' THEN 1
    WHEN 'highlight_correct_summary' THEN 1
    WHEN 'select_missing_word' THEN 1
    WHEN 'highlight_incorrect_words' THEN 1
    WHEN 'write_from_dictation' THEN 1
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if question needs human review
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Reset daily credits function
CREATE OR REPLACE FUNCTION public.reset_daily_credits()
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET 
    daily_credits_used = 0,
    daily_credits_reset_at = NOW()
  WHERE daily_credits_reset_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Use scoring credit function
CREATE OR REPLACE FUNCTION public.use_scoring_credit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_credits_remaining INTEGER;
  v_daily_used INTEGER;
  v_tier subscription_tier;
  v_daily_limit INTEGER;
BEGIN
  -- Reset daily credits if needed
  PERFORM public.reset_daily_credits();
  
  -- Get current subscription status
  SELECT tier, credits_remaining, daily_credits_used
  INTO v_tier, v_credits_remaining, v_daily_used
  FROM public.subscriptions
  WHERE user_id = p_user_id;
  
  -- Determine daily limit based on tier
  v_daily_limit := CASE v_tier
    WHEN 'free' THEN 10
    WHEN 'basic' THEN 50
    WHEN 'premium' THEN 200
    WHEN 'enterprise' THEN 1000
    ELSE 10
  END;
  
  -- Check if user can use credit
  IF v_daily_used >= v_daily_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Use credit
  UPDATE public.subscriptions
  SET 
    daily_credits_used = daily_credits_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-create subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, credits_remaining)
  VALUES (NEW.id, 'free', 10)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user subscription
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));