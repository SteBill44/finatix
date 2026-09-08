-- Practice mastery: never allow recording against another user
CREATE OR REPLACE FUNCTION public.update_syllabus_mastery(p_user_id uuid, p_course_id uuid, p_syllabus_area_index integer, p_syllabus_area_title text, p_is_correct boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_recent_attempts INTEGER;
  v_recent_correct INTEGER;
  v_total_attempts INTEGER;
  v_total_correct INTEGER;
  v_mastery NUMERIC;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  INSERT INTO user_syllabus_mastery (
    user_id, course_id, syllabus_area_index, syllabus_area_title,
    questions_attempted, questions_correct, last_attempted_at, updated_at
  )
  VALUES (
    p_user_id, p_course_id, p_syllabus_area_index, p_syllabus_area_title,
    1, CASE WHEN p_is_correct THEN 1 ELSE 0 END, now(), now()
  )
  ON CONFLICT (user_id, course_id, syllabus_area_index)
  DO UPDATE SET
    syllabus_area_title = COALESCE(p_syllabus_area_title, user_syllabus_mastery.syllabus_area_title),
    questions_attempted = user_syllabus_mastery.questions_attempted + 1,
    questions_correct = user_syllabus_mastery.questions_correct + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    last_attempted_at = now(),
    updated_at = now();

  SELECT
    COUNT(*) FILTER (WHERE attempted_at > now() - interval '7 days'),
    COUNT(*) FILTER (WHERE is_correct AND attempted_at > now() - interval '7 days'),
    COUNT(*),
    COUNT(*) FILTER (WHERE is_correct)
  INTO v_recent_attempts, v_recent_correct, v_total_attempts, v_total_correct
  FROM user_question_attempts
  WHERE user_id = p_user_id
    AND course_id = p_course_id
    AND syllabus_area_index = p_syllabus_area_index;

  IF v_total_attempts > 0 THEN
    IF v_recent_attempts > 0 THEN
      v_mastery := (
        (v_recent_correct::NUMERIC / v_recent_attempts) * 0.7 +
        (v_total_correct::NUMERIC / v_total_attempts) * 0.3
      ) * 100;
    ELSE
      v_mastery := (v_total_correct::NUMERIC / v_total_attempts) * 100;
    END IF;
  ELSE
    v_mastery := 0;
  END IF;

  UPDATE user_syllabus_mastery
  SET mastery_score = ROUND(v_mastery, 1)
  WHERE user_id = p_user_id
    AND course_id = p_course_id
    AND syllabus_area_index = p_syllabus_area_index;
END;
$function$;

-- Platform analytics: admins only
CREATE OR REPLACE FUNCTION public.get_platform_analytics()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.is_master_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'totalStudents', (SELECT COUNT(DISTINCT user_id) FROM enrollments),
    'totalEnrollments', (SELECT COUNT(*) FROM enrollments),
    'totalCompletions', (SELECT COUNT(*) FROM enrollments WHERE completed_at IS NOT NULL),
    'courseStats', (
      SELECT COALESCE(json_agg(course_stat), '[]'::json)
      FROM (
        SELECT
          c.id as course_id,
          c.title as course_title,
          COALESCE(e.enrollment_count, 0) as enrollments,
          COALESCE(e.completion_count, 0) as completions,
          COALESCE(r.avg_rating, 0) as "averageRating"
        FROM courses c
        LEFT JOIN (
          SELECT course_id, COUNT(*) as enrollment_count, COUNT(completed_at) as completion_count
          FROM enrollments GROUP BY course_id
        ) e ON c.id = e.course_id
        LEFT JOIN (
          SELECT course_id, ROUND(AVG(rating)::numeric, 2) as avg_rating
          FROM course_reviews GROUP BY course_id
        ) r ON c.id = r.course_id
        ORDER BY c.title
      ) course_stat
    )
  ) INTO result;

  RETURN result;
END;
$function$;

-- Drop unused legacy routines
DROP FUNCTION IF EXISTS public.get_course_detail_with_progress(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_lesson_detail_with_context(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_quiz_with_questions(uuid, uuid);

-- Internal-only routines: no direct API access
REVOKE ALL ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_rate_limits() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.find_user_id_by_email(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_profile_access(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_role_assignment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_deck_card_count() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits() TO service_role;
GRANT EXECUTE ON FUNCTION public.find_user_id_by_email(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.log_profile_access(uuid, text) TO service_role;

-- Signed-in only (no anonymous access)
REVOKE ALL ON FUNCTION public.get_adaptive_practice_questions(uuid, integer) FROM anon;
REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM anon;
REVOKE ALL ON FUNCTION public.get_platform_analytics() FROM anon;
REVOKE ALL ON FUNCTION public.get_user_profile_with_audit(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.broadcast_notification(text, text, text, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.broadcast_notification_targeted(text, text, text, jsonb, text, uuid[], app_role) FROM anon;
REVOKE ALL ON FUNCTION public.apply_referral_code(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.complete_referral(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_or_create_referral_code(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_referral_stats(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.claim_guest_purchases() FROM anon;
REVOKE ALL ON FUNCTION public.claim_guest_membership() FROM anon;
REVOKE ALL ON FUNCTION public.update_syllabus_mastery(uuid, uuid, integer, text, boolean) FROM anon;