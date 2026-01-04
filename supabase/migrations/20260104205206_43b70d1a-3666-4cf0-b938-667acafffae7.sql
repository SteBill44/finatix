-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.course_reviews;

-- Create a more restrictive policy - only enrolled users, admins, or the review author can view reviews
CREATE POLICY "Enrolled users and admins can view reviews"
ON public.course_reviews
FOR SELECT
USING (
  -- Author can always see their own review
  auth.uid() = user_id
  OR
  -- Admins can view all reviews
  has_role(auth.uid(), 'admin')
  OR
  is_master_admin(auth.uid())
  OR
  -- Enrolled users can view reviews for courses they're enrolled in
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.course_id = course_reviews.course_id
      AND e.user_id = auth.uid()
  )
);