-- 1. Quiz attempts: backend-only writes
DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can delete their own quiz attempts" ON public.quiz_attempts;
REVOKE INSERT, UPDATE, DELETE ON public.quiz_attempts FROM authenticated, anon;
GRANT SELECT ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;

-- 2. Certificates: backend-only issuance
DROP POLICY IF EXISTS "System can insert certificates" ON public.certificates;
REVOKE INSERT, UPDATE, DELETE ON public.certificates FROM authenticated, anon;
GRANT SELECT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

-- 3. Enrollments: users may no longer update rows (completion is awarded server-side)
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;

CREATE POLICY "Admins can update enrollments"
ON public.enrollments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

-- 4. Verified completion award
CREATE OR REPLACE FUNCTION public.award_course_completion(p_course_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_total int;
  v_done int;
  v_completed timestamptz;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT completed_at INTO v_completed
  FROM public.enrollments
  WHERE user_id = v_user AND course_id = p_course_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not enrolled in this course';
  END IF;

  IF v_completed IS NOT NULL THEN
    RETURN v_completed;
  END IF;

  SELECT count(*) INTO v_total FROM public.lessons WHERE course_id = p_course_id;

  SELECT count(*) INTO v_done
  FROM public.lesson_progress lp
  JOIN public.lessons l ON l.id = lp.lesson_id
  WHERE l.course_id = p_course_id
    AND lp.user_id = v_user
    AND lp.completed = true;

  IF v_total = 0 OR v_done < v_total THEN
    RETURN NULL;
  END IF;

  UPDATE public.enrollments
  SET completed_at = now()
  WHERE user_id = v_user AND course_id = p_course_id AND completed_at IS NULL
  RETURNING completed_at INTO v_completed;

  RETURN v_completed;
END;
$$;

REVOKE ALL ON FUNCTION public.award_course_completion(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_course_completion(uuid) TO authenticated, service_role;