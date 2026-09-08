DROP POLICY "Enrolled users and admins can view reviews" ON public.course_reviews;
CREATE POLICY "Enrolled users and admins can view reviews"
ON public.course_reviews FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.is_master_admin(auth.uid())
  OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = course_reviews.course_id AND e.user_id = auth.uid())
);

DROP POLICY "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.is_master_admin(auth.uid())
);

DROP POLICY "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_master_admin(auth.uid()));

DROP POLICY "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

GRANT EXECUTE ON FUNCTION public.update_syllabus_mastery(uuid, uuid, integer, text, boolean) TO authenticated;