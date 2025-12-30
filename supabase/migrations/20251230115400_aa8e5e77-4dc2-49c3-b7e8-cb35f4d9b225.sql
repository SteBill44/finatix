-- Add CIMA-specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cima_id TEXT,
ADD COLUMN IF NOT EXISTS siebel_id TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS cima_start_date DATE,
ADD COLUMN IF NOT EXISTS cima_end_date DATE;

-- Create index on cima_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_cima_id ON public.profiles(cima_id);

-- Add course_slug to enrollments to track which specific course was enrolled
-- (course_id already exists, but we need completed courses for CIMA report)
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS completed_course_slug TEXT;