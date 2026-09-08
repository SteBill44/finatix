DROP POLICY IF EXISTS "Admins can manage resources" ON public.lesson_resources;
CREATE POLICY "Admins can manage resources"
ON public.lesson_resources FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));