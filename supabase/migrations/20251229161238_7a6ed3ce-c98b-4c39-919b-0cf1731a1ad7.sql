-- Drop the existing permissive policy that exposes all data
DROP POLICY IF EXISTS "Quiz questions are viewable by everyone" ON public.quiz_questions;

-- Create a security definer function to check if user has attempted a specific quiz
CREATE OR REPLACE FUNCTION public.has_attempted_quiz(_user_id uuid, _quiz_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.quiz_attempts qa
    JOIN public.quizzes q ON q.course_id = qa.course_id
    WHERE qa.user_id = _user_id
      AND q.id = _quiz_id
  )
$$;

-- Create a function to get quiz questions safely (without correct_answer for unattempted quizzes)
CREATE OR REPLACE FUNCTION public.get_quiz_questions(_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question text,
  options jsonb,
  correct_answer integer,
  order_index integer,
  explanation text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _has_attempted boolean;
BEGIN
  -- Check if user has attempted this quiz
  SELECT public.has_attempted_quiz(_user_id, _quiz_id) INTO _has_attempted;
  
  -- Return questions - hide correct_answer if not attempted
  RETURN QUERY
  SELECT 
    qq.id,
    qq.quiz_id,
    qq.question,
    qq.options,
    CASE WHEN _has_attempted THEN qq.correct_answer ELSE NULL END as correct_answer,
    qq.order_index,
    CASE WHEN _has_attempted THEN qq.explanation ELSE NULL END as explanation,
    qq.created_at
  FROM public.quiz_questions qq
  WHERE qq.quiz_id = _quiz_id
  ORDER BY qq.order_index;
END;
$$;

-- Create restrictive policy - only allow direct access for checking answers during quiz submission
-- This prevents direct SELECT from exposing answers
CREATE POLICY "Quiz questions viewable via secure function only"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (
  -- Allow access only if user has already attempted this quiz
  public.has_attempted_quiz(auth.uid(), quiz_id)
);