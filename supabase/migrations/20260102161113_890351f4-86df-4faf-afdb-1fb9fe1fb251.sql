-- Add lesson_id to quizzes table for lesson-specific quizzes
ALTER TABLE public.quizzes 
ADD COLUMN lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX idx_quizzes_lesson_id ON public.quizzes(lesson_id);

-- Add quiz_id to quiz_attempts to track which specific quiz was attempted
ALTER TABLE public.quiz_attempts
ADD COLUMN quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);