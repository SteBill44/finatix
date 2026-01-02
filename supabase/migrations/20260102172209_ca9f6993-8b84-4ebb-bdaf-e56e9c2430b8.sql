-- Add syllabus_area_index to quiz_questions to map questions to syllabus areas
ALTER TABLE public.quiz_questions 
ADD COLUMN syllabus_area_index integer DEFAULT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.quiz_questions.syllabus_area_index IS 'Index of the syllabus area this question belongs to (references course_syllabuses.syllabus_areas array index)';