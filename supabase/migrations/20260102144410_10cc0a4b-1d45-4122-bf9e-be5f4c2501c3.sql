-- Create table to store editable course syllabuses
CREATE TABLE public.course_syllabuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  objective TEXT,
  syllabus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id)
);

-- Enable RLS
ALTER TABLE public.course_syllabuses ENABLE ROW LEVEL SECURITY;

-- Anyone can view syllabuses
CREATE POLICY "Syllabuses are viewable by everyone"
ON public.course_syllabuses
FOR SELECT
USING (true);

-- Only admins can insert syllabuses
CREATE POLICY "Admins can insert syllabuses"
ON public.course_syllabuses
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update syllabuses
CREATE POLICY "Admins can update syllabuses"
ON public.course_syllabuses
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete syllabuses
CREATE POLICY "Admins can delete syllabuses"
ON public.course_syllabuses
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_course_syllabuses_updated_at
BEFORE UPDATE ON public.course_syllabuses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();