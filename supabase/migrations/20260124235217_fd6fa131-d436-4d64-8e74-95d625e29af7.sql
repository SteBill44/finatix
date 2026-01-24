-- Add metadata columns to quiz_questions for adaptive learning
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS times_shown INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS times_correct INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_practice_pool BOOLEAN DEFAULT false;

-- Add constraint for difficulty_level
ALTER TABLE public.quiz_questions 
ADD CONSTRAINT quiz_questions_difficulty_check 
CHECK (difficulty_level IN ('easy', 'medium', 'hard'));

-- Create user_question_attempts table to track individual question performance
CREATE TABLE public.user_question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  course_id UUID NOT NULL,
  syllabus_area_index INTEGER,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  attempted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for efficient querying
CREATE INDEX idx_user_question_attempts_user_course ON public.user_question_attempts(user_id, course_id);
CREATE INDEX idx_user_question_attempts_question ON public.user_question_attempts(question_id);
CREATE INDEX idx_user_question_attempts_syllabus ON public.user_question_attempts(user_id, course_id, syllabus_area_index);

-- Enable RLS
ALTER TABLE public.user_question_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_question_attempts
CREATE POLICY "Users can view their own attempts"
ON public.user_question_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
ON public.user_question_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attempts"
ON public.user_question_attempts FOR DELETE
USING (auth.uid() = user_id);

-- Create user_syllabus_mastery table to track mastery per syllabus area
CREATE TABLE public.user_syllabus_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  syllabus_area_index INTEGER NOT NULL,
  syllabus_area_title TEXT,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  mastery_score NUMERIC DEFAULT 0,
  last_attempted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, course_id, syllabus_area_index)
);

-- Create indexes for efficient querying
CREATE INDEX idx_user_syllabus_mastery_user_course ON public.user_syllabus_mastery(user_id, course_id);

-- Enable RLS
ALTER TABLE public.user_syllabus_mastery ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_syllabus_mastery
CREATE POLICY "Users can view their own mastery"
ON public.user_syllabus_mastery FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mastery"
ON public.user_syllabus_mastery FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mastery"
ON public.user_syllabus_mastery FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mastery"
ON public.user_syllabus_mastery FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update mastery scores (called after quiz submission)
CREATE OR REPLACE FUNCTION public.update_syllabus_mastery(
  p_user_id UUID,
  p_course_id UUID,
  p_syllabus_area_index INTEGER,
  p_syllabus_area_title TEXT,
  p_is_correct BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_attempts INTEGER;
  v_recent_correct INTEGER;
  v_total_attempts INTEGER;
  v_total_correct INTEGER;
  v_mastery NUMERIC;
BEGIN
  -- Insert or update the mastery record
  INSERT INTO user_syllabus_mastery (
    user_id, course_id, syllabus_area_index, syllabus_area_title,
    questions_attempted, questions_correct, last_attempted_at, updated_at
  )
  VALUES (
    p_user_id, p_course_id, p_syllabus_area_index, p_syllabus_area_title,
    1, CASE WHEN p_is_correct THEN 1 ELSE 0 END, now(), now()
  )
  ON CONFLICT (user_id, course_id, syllabus_area_index)
  DO UPDATE SET
    syllabus_area_title = COALESCE(p_syllabus_area_title, user_syllabus_mastery.syllabus_area_title),
    questions_attempted = user_syllabus_mastery.questions_attempted + 1,
    questions_correct = user_syllabus_mastery.questions_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    last_attempted_at = now(),
    updated_at = now();

  -- Calculate mastery score using weighted recent performance
  -- Recent = last 20 attempts (70% weight), Historical = all attempts (30% weight)
  SELECT 
    COUNT(*) FILTER (WHERE attempted_at > now() - interval '7 days'),
    COUNT(*) FILTER (WHERE is_correct AND attempted_at > now() - interval '7 days'),
    COUNT(*),
    COUNT(*) FILTER (WHERE is_correct)
  INTO v_recent_attempts, v_recent_correct, v_total_attempts, v_total_correct
  FROM user_question_attempts
  WHERE user_id = p_user_id 
    AND course_id = p_course_id 
    AND syllabus_area_index = p_syllabus_area_index;

  -- Calculate weighted mastery
  IF v_total_attempts > 0 THEN
    IF v_recent_attempts > 0 THEN
      v_mastery := (
        (v_recent_correct::NUMERIC / v_recent_attempts) * 0.7 +
        (v_total_correct::NUMERIC / v_total_attempts) * 0.3
      ) * 100;
    ELSE
      v_mastery := (v_total_correct::NUMERIC / v_total_attempts) * 100;
    END IF;
  ELSE
    v_mastery := 0;
  END IF;

  -- Update the mastery score
  UPDATE user_syllabus_mastery
  SET mastery_score = ROUND(v_mastery, 1)
  WHERE user_id = p_user_id 
    AND course_id = p_course_id 
    AND syllabus_area_index = p_syllabus_area_index;
END;
$$;

-- Create function to get adaptive practice questions
CREATE OR REPLACE FUNCTION public.get_adaptive_practice_questions(
  p_course_id UUID,
  p_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  quiz_id UUID,
  question TEXT,
  question_type TEXT,
  options JSONB,
  difficulty_level TEXT,
  syllabus_area_index INTEGER,
  image_url TEXT,
  hotspot_regions JSONB,
  drag_items JSONB,
  drag_targets JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_weak_count INTEGER;
  v_medium_count INTEGER;
  v_strong_count INTEGER;
BEGIN
  -- Calculate distribution: 60% weak, 30% medium, 10% strong
  v_weak_count := CEIL(p_count * 0.6);
  v_medium_count := CEIL(p_count * 0.3);
  v_strong_count := p_count - v_weak_count - v_medium_count;

  RETURN QUERY
  WITH mastery_data AS (
    SELECT 
      usm.syllabus_area_index,
      usm.mastery_score,
      CASE 
        WHEN usm.mastery_score < 50 THEN 'weak'
        WHEN usm.mastery_score < 75 THEN 'medium'
        ELSE 'strong'
      END as mastery_level
    FROM user_syllabus_mastery usm
    WHERE usm.user_id = v_user_id AND usm.course_id = p_course_id
  ),
  recent_attempts AS (
    SELECT question_id 
    FROM user_question_attempts
    WHERE user_id = v_user_id 
      AND course_id = p_course_id
      AND attempted_at > now() - interval '24 hours'
  ),
  eligible_questions AS (
    SELECT 
      qq.*,
      q.course_id,
      COALESCE(md.mastery_level, 'weak') as mastery_level,
      COALESCE(md.mastery_score, 0) as area_mastery
    FROM quiz_questions qq
    JOIN quizzes q ON qq.quiz_id = q.id
    LEFT JOIN mastery_data md ON qq.syllabus_area_index = md.syllabus_area_index
    WHERE q.course_id = p_course_id
      AND qq.is_practice_pool = true
      AND qq.id NOT IN (SELECT question_id FROM recent_attempts)
  ),
  prioritized AS (
    -- Weak areas first
    (SELECT * FROM eligible_questions WHERE mastery_level = 'weak' ORDER BY random() LIMIT v_weak_count)
    UNION ALL
    -- Medium areas
    (SELECT * FROM eligible_questions WHERE mastery_level = 'medium' ORDER BY random() LIMIT v_medium_count)
    UNION ALL
    -- Strong areas (retention)
    (SELECT * FROM eligible_questions WHERE mastery_level = 'strong' ORDER BY random() LIMIT v_strong_count)
  )
  SELECT 
    p.id,
    p.quiz_id,
    p.question,
    p.question_type,
    p.options,
    p.difficulty_level,
    p.syllabus_area_index,
    p.image_url,
    p.hotspot_regions,
    p.drag_items,
    p.drag_targets
  FROM prioritized p
  ORDER BY random()
  LIMIT p_count;
END;
$$;