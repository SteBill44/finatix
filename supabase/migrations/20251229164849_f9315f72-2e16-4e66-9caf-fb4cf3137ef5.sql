-- Allow admins to insert lessons
CREATE POLICY "Admins can insert lessons"
ON public.lessons
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update lessons
CREATE POLICY "Admins can update lessons"
ON public.lessons
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete lessons
CREATE POLICY "Admins can delete lessons"
ON public.lessons
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));