-- Security fix: restrict quiz question reads to enrolled users and admins only.
-- Previously "Quiz questions are viewable by everyone" exposed correct answers
-- to any unauthenticated or non-enrolled request.

-- Drop the overly-permissive public policy
DROP POLICY IF EXISTS "Quiz questions are viewable by everyone" ON public.quiz_questions;

-- Enrolled users may read questions for quizzes in their enrolled courses
CREATE POLICY "Enrolled users can view quiz questions"
  ON public.quiz_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.quizzes q
      JOIN public.enrollments e ON q.course_id = e.course_id
      WHERE q.id = quiz_questions.quiz_id
        AND e.user_id = auth.uid()
    )
  );

-- Admins can read all quiz questions (needed for admin panel)
CREATE POLICY "Admins can view all quiz questions"
  ON public.quiz_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'master_admin')
    )
  );

-- Also tighten quiz read policy: only enrolled users + admins should see quizzes
DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON public.quizzes;

CREATE POLICY "Enrolled users can view quizzes"
  ON public.quizzes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE course_id = quizzes.course_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all quizzes"
  ON public.quizzes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'master_admin')
    )
  );
