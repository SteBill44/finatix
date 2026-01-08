-- Allow admins to delete enrollments (unenroll users from courses)
CREATE POLICY "Admins can delete enrollments"
ON public.enrollments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

-- Allow admins to view all enrollments (needed to manage them)
CREATE POLICY "Admins can view all enrollments"
ON public.enrollments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));