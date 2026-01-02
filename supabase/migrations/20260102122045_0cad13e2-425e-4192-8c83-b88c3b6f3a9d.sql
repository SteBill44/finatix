-- Add question type column to quiz_questions
ALTER TABLE quiz_questions 
ADD COLUMN question_type text NOT NULL DEFAULT 'multiple_choice';

-- Add correct_answers for multiple-response questions (array of correct indices)
ALTER TABLE quiz_questions 
ADD COLUMN correct_answers integer[] DEFAULT NULL;

-- Add number_answer for number entry questions
ALTER TABLE quiz_questions 
ADD COLUMN number_answer numeric DEFAULT NULL;

-- Add number_tolerance for number entry (allow +/- range)
ALTER TABLE quiz_questions 
ADD COLUMN number_tolerance numeric DEFAULT 0;

-- Add image_url for hotspot questions
ALTER TABLE quiz_questions 
ADD COLUMN image_url text DEFAULT NULL;

-- Add hotspot_regions for hotspot questions (JSON array of clickable regions)
-- Format: [{id: string, x: number, y: number, width: number, height: number, isCorrect: boolean}]
ALTER TABLE quiz_questions 
ADD COLUMN hotspot_regions jsonb DEFAULT NULL;

-- Add drag_items for drag-and-drop questions
-- Format: [{id: string, text: string, correctPosition: number}] for ordering
-- Or: [{id: string, text: string, matchTarget: string}] for matching
ALTER TABLE quiz_questions 
ADD COLUMN drag_items jsonb DEFAULT NULL;

-- Add drag_targets for drag-and-drop matching questions
-- Format: [{id: string, text: string}]
ALTER TABLE quiz_questions 
ADD COLUMN drag_targets jsonb DEFAULT NULL;

-- Add constraint to validate question_type values
ALTER TABLE quiz_questions 
ADD CONSTRAINT valid_question_type 
CHECK (question_type IN ('multiple_choice', 'multiple_response', 'number_entry', 'hotspot', 'drag_drop'));