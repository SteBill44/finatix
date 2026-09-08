CREATE OR REPLACE FUNCTION public.has_course_access(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result boolean;
BEGIN
  SELECT
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = _course_id AND coalesce(c.price, 0) = 0)
    OR (
      _user_id IS NOT NULL AND (
        public.has_role(_user_id, 'admin'::app_role)
        OR public.is_master_admin(_user_id)
        OR EXISTS (
          SELECT 1 FROM public.enrollments e
          WHERE e.user_id = _user_id AND e.course_id = _course_id
        )
        OR EXISTS (
          SELECT 1 FROM public.subscriptions s
          WHERE s.user_id = _user_id
            AND (
              (s.status IN ('active', 'trialing')
                AND (s.current_period_end IS NULL OR s.current_period_end > now()))
              OR (s.status = 'canceled' AND s.current_period_end > now())
            )
        )
      )
    )
  INTO result;
  RETURN coalesce(result, false);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.has_course_access(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_course_access(uuid, uuid) TO authenticated, anon, service_role;