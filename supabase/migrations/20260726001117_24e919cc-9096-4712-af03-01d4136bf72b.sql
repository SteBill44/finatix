
-- 1. site_settings: restrict SELECT to admins only
DROP POLICY IF EXISTS "Authenticated users can read site settings" ON public.site_settings;
CREATE POLICY "Admins can read site settings"
  ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_master_admin(auth.uid()));

-- 2. profile_access_logs: prevent spoofed inserts. Only allow log_profile_access (SECURITY DEFINER) to write.
DROP POLICY IF EXISTS "System inserts audit logs" ON public.profile_access_logs;
CREATE POLICY "Only service role can insert audit logs"
  ON public.profile_access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (false);
REVOKE INSERT ON public.profile_access_logs FROM authenticated, anon;
GRANT INSERT ON public.profile_access_logs TO service_role;

-- 3. Revoke EXECUTE from anon on SECURITY DEFINER helpers that don't need anonymous access.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_master_admin(uuid) FROM anon;
