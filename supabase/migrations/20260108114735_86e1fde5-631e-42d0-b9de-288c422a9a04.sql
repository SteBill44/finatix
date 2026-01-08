-- Allow admins to enroll users in courses
CREATE POLICY "Admins can insert enrollments"
ON public.enrollments
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));