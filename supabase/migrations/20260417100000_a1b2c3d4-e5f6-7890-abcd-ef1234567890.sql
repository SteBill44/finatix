-- ============================================================
-- Migration: Critical fixes
-- 1. FK constraint on certificates.user_id
-- 2. user_answer column on user_question_attempts
-- 3. Missing indexes
-- 4. get_quiz_questions security: also check enrollment
-- ============================================================

-- 1. Foreign key on certificates.user_id (referential integrity was missing)
ALTER TABLE public.certificates
  ADD CONSTRAINT certificates_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Store what the student actually answered (enables post-exam review)
ALTER TABLE public.user_question_attempts
  ADD COLUMN user_answer JSONB;

-- 3. Missing performance indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course_order
  ON public.lessons(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON public.profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_certificates_user_course
  ON public.certificates(user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_completed
  ON public.enrollments(user_id, completed_at);

CREATE INDEX IF NOT EXISTS idx_courses_slug
  ON public.courses(slug);

-- 4. Updated get_quiz_questions: gate on enrollment, not just prior attempt
CREATE OR REPLACE FUNCTION public.get_quiz_questions(_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question text,
  options jsonb,
  correct_answer integer,
  correct_answers integer[],
  number_answer numeric,
  number_tolerance numeric,
  question_type text,
  order_index integer,
  explanation text,
  image_url text,
  hotspot_regions jsonb,
  drag_items jsonb,
  drag_targets jsonb,
  difficulty_level integer,
  syllabus_area_index integer,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id     uuid := auth.uid();
  _course_id   uuid;
  _is_enrolled boolean := false;
  _is_admin    boolean := false;
  _has_attempted boolean := false;
BEGIN
  -- Resolve course for this quiz
  SELECT q.course_id INTO _course_id
  FROM public.quizzes q
  WHERE q.id = _quiz_id;

  IF _course_id IS NULL THEN
    RETURN; -- quiz not found
  END IF;

  -- Check admin
  SELECT public.has_role(_user_id, 'admin') INTO _is_admin;

  -- Check enrollment
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = _user_id AND e.course_id = _course_id
  ) INTO _is_enrolled;

  -- Deny access if not enrolled and not admin
  IF NOT _is_enrolled AND NOT _is_admin THEN
    RETURN;
  END IF;

  -- Check if previously attempted (controls answer/explanation visibility)
  SELECT public.has_attempted_quiz(_user_id, _quiz_id) INTO _has_attempted;

  RETURN QUERY
  SELECT
    qq.id,
    qq.quiz_id,
    qq.question,
    qq.options,
    CASE WHEN _has_attempted THEN qq.correct_answer    ELSE NULL END,
    CASE WHEN _has_attempted THEN qq.correct_answers   ELSE NULL END,
    CASE WHEN _has_attempted THEN qq.number_answer     ELSE NULL END,
    CASE WHEN _has_attempted THEN qq.number_tolerance  ELSE NULL END,
    qq.question_type,
    qq.order_index,
    CASE WHEN _has_attempted THEN qq.explanation       ELSE NULL END,
    qq.image_url,
    qq.hotspot_regions,
    qq.drag_items,
    qq.drag_targets,
    qq.difficulty_level,
    qq.syllabus_area_index,
    qq.created_at
  FROM public.quiz_questions qq
  WHERE qq.quiz_id = _quiz_id
    AND (qq.deleted_at IS NULL OR _is_admin)
  ORDER BY qq.order_index;
END;
$$;
