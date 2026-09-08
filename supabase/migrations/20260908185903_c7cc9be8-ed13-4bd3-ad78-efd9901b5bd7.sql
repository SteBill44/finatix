CREATE OR REPLACE FUNCTION public.has_course_access(_user_id uuid, _course_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result boolean;
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT
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
  INTO result;

  RETURN coalesce(result, false);
END;
$function$;