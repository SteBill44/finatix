DROP POLICY "Admins can view interest registrations" ON public.interest_registrations;
CREATE POLICY "Admins can view interest registrations"
ON public.interest_registrations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_master_admin(auth.uid()));

DROP POLICY "Admins can delete interest registrations" ON public.interest_registrations;
CREATE POLICY "Admins can delete interest registrations"
ON public.interest_registrations FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_master_admin(auth.uid()));