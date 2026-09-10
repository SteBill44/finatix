
CREATE OR REPLACE FUNCTION public.has_paid_entitlement(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result boolean;
BEGIN
  IF _user_id IS NULL OR _course_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT
    EXISTS (
      SELECT 1 FROM public.course_purchases p
      WHERE p.user_id = _user_id
        AND p.course_id = _course_id
        AND p.status IN ('paid', 'complete', 'completed')
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
$$;

REVOKE ALL ON FUNCTION public.has_paid_entitlement(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_paid_entitlement(uuid, uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_free_course(_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = _course_id AND coalesce(c.price, 0) = 0
  );
$$;

REVOKE ALL ON FUNCTION public.is_free_course(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_free_course(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_course_access(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result boolean;
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT
    public.has_role(_user_id, 'admin'::app_role)
    OR public.is_master_admin(_user_id)
    OR public.has_paid_entitlement(_user_id, _course_id)
    OR (
      public.is_free_course(_course_id)
      AND EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.user_id = _user_id AND e.course_id = _course_id
      )
    )
  INTO result;

  RETURN coalesce(result, false);
END;
$$;

DROP POLICY IF EXISTS "Users can enroll themselves" ON public.enrollments;
CREATE POLICY "Users can enroll in free or entitled courses"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.is_free_course(course_id)
    OR public.has_paid_entitlement(auth.uid(), course_id)
  )
);

DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;
CREATE POLICY "Users can update their own enrollments"
ON public.enrollments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.is_free_course(course_id)
    OR public.has_paid_entitlement(auth.uid(), course_id)
  )
);
