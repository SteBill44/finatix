
-- Add quiz_type column to quizzes table
ALTER TABLE public.quizzes ADD COLUMN quiz_type text NOT NULL DEFAULT 'lesson_quiz';

-- Add focus_violations column to quiz_attempts
ALTER TABLE public.quiz_attempts ADD COLUMN focus_violations integer DEFAULT 0;

-- Backfill existing data: quizzes with lesson_id -> lesson_quiz (already default)
-- Quizzes with titles containing 'Mock Exam' -> mock_exam
UPDATE public.quizzes SET quiz_type = 'mock_exam' WHERE lesson_id IS NULL AND title ILIKE '%mock exam%';

-- Quizzes with titles containing 'Practice' -> practice  
UPDATE public.quizzes SET quiz_type = 'practice' WHERE lesson_id IS NULL AND title ILIKE '%practice%';

-- Create final exam quiz entry for each course that doesn't have one
INSERT INTO public.quizzes (course_id, title, description, order_index, quiz_type)
SELECT c.id, 'Final Exam - ' || c.title, 'Comprehensive final examination for ' || c.title, 999, 'final_exam'
FROM public.courses c
WHERE NOT EXISTS (
  SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.quiz_type = 'final_exam'
);

-- Create practice pool quiz entry for each course that doesn't have one
INSERT INTO public.quizzes (course_id, title, description, order_index, quiz_type)
SELECT c.id, 'Practice Question Bank - ' || c.title, '500 practice questions for ' || c.title, 998, 'practice'
FROM public.courses c
WHERE NOT EXISTS (
  SELECT 1 FROM public.quizzes q WHERE q.course_id = c.id AND q.quiz_type = 'practice'
);
