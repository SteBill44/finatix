
CREATE OR REPLACE FUNCTION public.broadcast_notification_targeted(
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_data jsonb DEFAULT NULL,
  p_audience text DEFAULT 'all',
  p_course_ids uuid[] DEFAULT NULL,
  p_role app_role DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.is_master_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  WITH target_users AS (
    SELECT DISTINCT p.user_id
    FROM public.profiles p
    WHERE
      CASE p_audience
        WHEN 'all' THEN TRUE
        WHEN 'enrolled' THEN EXISTS (
          SELECT 1 FROM public.enrollments e
          WHERE e.user_id = p.user_id
            AND (p_course_ids IS NULL OR e.course_id = ANY(p_course_ids))
        )
        WHEN 'completed' THEN EXISTS (
          SELECT 1 FROM public.enrollments e
          WHERE e.user_id = p.user_id
            AND e.completed_at IS NOT NULL
            AND (p_course_ids IS NULL OR e.course_id = ANY(p_course_ids))
        )
        WHEN 'not_enrolled' THEN NOT EXISTS (
          SELECT 1 FROM public.enrollments e
          WHERE e.user_id = p.user_id
            AND (p_course_ids IS NULL OR e.course_id = ANY(p_course_ids))
        )
        WHEN 'role' THEN EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = p.user_id AND ur.role = p_role
        )
        ELSE FALSE
      END
  )
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT user_id, p_type, p_title, p_message, p_data FROM target_users;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_notification_targeted(text, text, text, jsonb, text, uuid[], app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.broadcast_notification_targeted(text, text, text, jsonb, text, uuid[], app_role) TO authenticated;
