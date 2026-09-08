DROP POLICY IF EXISTS "Authenticated users can insert snapshots" ON public.visitor_snapshots;
CREATE POLICY "Admins can insert snapshots"
ON public.visitor_snapshots FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_master_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can read visitor snapshots" ON public.visitor_snapshots;
CREATE POLICY "Admins can read visitor snapshots"
ON public.visitor_snapshots FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_master_admin(auth.uid()));