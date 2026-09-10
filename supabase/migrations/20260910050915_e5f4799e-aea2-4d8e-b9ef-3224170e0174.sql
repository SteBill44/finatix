
INSERT INTO public.site_settings (key, value)
VALUES ('payments_environment', 'sandbox')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.active_payments_environment()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT coalesce(
    (SELECT value FROM public.site_settings WHERE key = 'payments_environment'),
    'sandbox'
  );
$function$;

REVOKE ALL ON FUNCTION public.active_payments_environment() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.active_payments_environment() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_paid_entitlement(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result boolean;
  active_env text;
BEGIN
  IF _user_id IS NULL OR _course_id IS NULL THEN
    RETURN false;
  END IF;

  active_env := public.active_payments_environment();

  SELECT
    EXISTS (
      SELECT 1 FROM public.course_purchases p
      WHERE p.user_id = _user_id
        AND p.course_id = _course_id
        AND p.status IN ('paid', 'complete', 'completed')
        AND p.environment = active_env
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.user_id = _user_id
        AND e.course_id = _course_id
        AND e.granted_by_admin
    )
    OR EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND s.environment = active_env
        AND (
          (s.status IN ('active', 'trialing')
            AND (s.current_period_end IS NULL OR s.current_period_end > now()))
          OR (s.status = 'canceled' AND s.current_period_end > now())
        )
    )
  INTO result;

  RETURN coalesce(result, false);
END;
$function$;
