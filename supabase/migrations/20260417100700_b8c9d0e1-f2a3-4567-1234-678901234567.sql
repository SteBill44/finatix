-- ============================================================
-- Migration: Soft deletes for courses, lessons, quiz_questions
-- Adds deleted_at column + partial indexes for active-record queries
-- ============================================================

ALTER TABLE public.courses        ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE public.lessons         ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE public.quiz_questions  ADD COLUMN deleted_at TIMESTAMPTZ;

-- Partial indexes so queries filtering WHERE deleted_at IS NULL are fast
CREATE INDEX idx_courses_active        ON public.courses(id)        WHERE deleted_at IS NULL;
CREATE INDEX idx_lessons_active        ON public.lessons(id)         WHERE deleted_at IS NULL;
CREATE INDEX idx_quiz_questions_active ON public.quiz_questions(id)  WHERE deleted_at IS NULL;

-- Convenience function: soft-delete a course and cascade to lessons/quizzes
CREATE OR REPLACE FUNCTION public.soft_delete_course(_course_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete courses';
  END IF;

  UPDATE public.courses       SET deleted_at = NOW() WHERE id = _course_id AND deleted_at IS NULL;
  UPDATE public.lessons        SET deleted_at = NOW() WHERE course_id = _course_id AND deleted_at IS NULL;
  UPDATE public.quiz_questions SET deleted_at = NOW()
    WHERE quiz_id IN (
      SELECT id FROM public.quizzes WHERE course_id = _course_id
    )
    AND deleted_at IS NULL;
END;
$$;

-- Convenience function: soft-delete a single lesson
CREATE OR REPLACE FUNCTION public.soft_delete_lesson(_lesson_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete lessons';
  END IF;

  UPDATE public.lessons        SET deleted_at = NOW() WHERE id = _lesson_id AND deleted_at IS NULL;
  UPDATE public.quiz_questions SET deleted_at = NOW()
    WHERE quiz_id IN (
      SELECT id FROM public.quizzes WHERE lesson_id = _lesson_id
    )
    AND deleted_at IS NULL;
END;
$$;
