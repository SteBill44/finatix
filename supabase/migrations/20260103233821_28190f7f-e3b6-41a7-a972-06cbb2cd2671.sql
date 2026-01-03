-- Allow users to delete (unenroll from) their own enrollments
CREATE POLICY "Users can delete their own enrollments" 
ON public.enrollments 
FOR DELETE 
USING (auth.uid() = user_id);