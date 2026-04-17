-- ============================================================
-- Migration: Mock exam enhancements
-- Table: mock_exam_specifications
-- Columns added: quiz_attempts.section_scores, quiz_attempts.passed
-- ============================================================

-- Per-quiz exam metadata (only applies to mock_exam type quizzes)
CREATE TABLE public.mock_exam_specifications (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id                  UUID NOT NULL UNIQUE REFERENCES public.quizzes(id) ON DELETE CASCADE,
  time_limit_minutes       INTEGER,
  passing_score_percentage INTEGER NOT NULL DEFAULT 50
                             CHECK (passing_score_percentage BETWEEN 0 AND 100),
  sections                 JSONB,  -- [{name, question_count, time_limit_minutes}]
  instructions             TEXT,
  is_proctored             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns to quiz_attempts
ALTER TABLE public.quiz_attempts
  ADD COLUMN section_scores JSONB,    -- [{section_name, score, max_score}]
  ADD COLUMN passed         BOOLEAN;  -- set by submit-quiz based on passing_score_percentage

-- Index for fetching mock spec alongside quiz
CREATE INDEX idx_mock_spec_quiz ON public.mock_exam_specifications(quiz_id);

-- RLS
ALTER TABLE public.mock_exam_specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads mock specs" ON public.mock_exam_specifications
  FOR SELECT USING (true);

CREATE POLICY "Admin manages mock specs" ON public.mock_exam_specifications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function: get mock exam result with pass/fail determination
CREATE OR REPLACE FUNCTION public.get_mock_exam_result(
  _attempt_id uuid
)
RETURNS TABLE (
  attempt_id    uuid,
  score         integer,
  max_score     integer,
  percentage    numeric,
  passed        boolean,
  passing_pct   integer,
  time_taken    integer,
  attempted_at  timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    qa.id,
    qa.score,
    qa.max_score,
    ROUND((qa.score::numeric / NULLIF(qa.max_score, 0)) * 100, 1),
    qa.passed,
    COALESCE(ms.passing_score_percentage, 50),
    qa.time_taken_seconds,
    qa.attempted_at
  FROM public.quiz_attempts qa
  LEFT JOIN public.mock_exam_specifications ms ON ms.quiz_id = qa.quiz_id
  WHERE qa.id = _attempt_id
    AND qa.user_id = auth.uid();
$$;
