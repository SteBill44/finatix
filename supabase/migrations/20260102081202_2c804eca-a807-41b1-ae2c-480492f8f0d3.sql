-- Add order_index column to lesson_resources for reordering
ALTER TABLE public.lesson_resources 
ADD COLUMN order_index integer NOT NULL DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX idx_lesson_resources_order ON public.lesson_resources (lesson_id, order_index);