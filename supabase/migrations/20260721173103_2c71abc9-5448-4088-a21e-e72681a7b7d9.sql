
-- 1) Fix has_attempted_quiz: compare quiz_id directly
CREATE OR REPLACE FUNCTION public.has_attempted_quiz(_user_id uuid, _quiz_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.quiz_attempts qa
    WHERE qa.user_id = _user_id
      AND qa.quiz_id = _quiz_id
  )
$$;

-- 2) Certificates: remove public policy, add verify function
DROP POLICY IF EXISTS "Anyone can verify certificates by number" ON public.certificates;

CREATE OR REPLACE FUNCTION public.verify_certificate(p_certificate_number text)
RETURNS TABLE(
  certificate_number text,
  issued_at timestamptz,
  course_title text,
  holder_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.certificate_number,
    c.issued_at,
    co.title AS course_title,
    p.full_name AS holder_name
  FROM public.certificates c
  LEFT JOIN public.courses co ON co.id = c.course_id
  LEFT JOIN public.profiles p ON p.user_id = c.user_id
  WHERE c.certificate_number = p_certificate_number
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- 3) Discussion posts: authenticated-only
DROP POLICY IF EXISTS "Anyone can view discussion posts" ON public.discussion_posts;
CREATE POLICY "Authenticated users can view discussion posts"
ON public.discussion_posts
FOR SELECT
TO authenticated
USING (true);

-- 4) Storage RLS for lesson-videos and resources (buckets already flipped private)
DROP POLICY IF EXISTS "Public can view lesson videos" ON storage.objects;
DROP POLICY IF EXISTS "Resources are publicly accessible" ON storage.objects;

CREATE POLICY "Enrolled users can view lesson videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-videos'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.is_master_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.enrollments e ON e.course_id = l.course_id
      WHERE l.id::text = (storage.foldername(name))[1]
        AND e.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Enrolled users can view resources"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resources'
  AND (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.is_master_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.lesson_resources lr
      JOIN public.lessons l ON l.id = lr.lesson_id
      JOIN public.enrollments e ON e.course_id = l.course_id
      WHERE e.user_id = auth.uid()
        AND lr.file_url LIKE '%/' || name
    )
  )
);

-- 5) Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated where unnecessary
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_master_admin(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_attempted_quiz(uuid, uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_profile_access(uuid, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_syllabus_mastery(uuid, uuid, integer, text, boolean) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_deck_card_count() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM anon, authenticated, PUBLIC;

REVOKE EXECUTE ON FUNCTION public.get_or_create_referral_code(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_referral_code(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_referral(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_referral_stats(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_platform_analytics() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_stats() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_profile_with_audit(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_adaptive_practice_questions(uuid, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_quiz_questions(uuid) FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_referral_code(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_referral(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_referral_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile_with_audit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_adaptive_practice_questions(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions(uuid) TO authenticated;
