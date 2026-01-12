-- Add DELETE policies for user tables that are missing them

-- lesson_progress: Users can delete their own progress
CREATE POLICY "Users can delete their own lesson progress"
ON public.lesson_progress
FOR DELETE
USING (auth.uid() = user_id);

-- flashcard_progress: Users can delete their own progress
CREATE POLICY "Users can delete their own flashcard progress"
ON public.flashcard_progress
FOR DELETE
USING (auth.uid() = user_id);

-- notification_preferences: Users can delete their own preferences
CREATE POLICY "Users can delete their own notification preferences"
ON public.notification_preferences
FOR DELETE
USING (auth.uid() = user_id);