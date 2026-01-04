-- Add time_taken_seconds column to quiz_attempts for tracking exam duration
ALTER TABLE public.quiz_attempts 
ADD COLUMN time_taken_seconds integer DEFAULT NULL;