CREATE OR REPLACE FUNCTION public.has_course_access(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- free courses are open to everyone
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
    );
$$;

REVOKE EXECUTE ON FUNCTION public.has_course_access(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_course_access(uuid, uuid) TO authenticated, anon, service_role;

-- Lessons: full rows only for people with access to the course
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
CREATE POLICY "Lessons viewable with course access"
ON public.lessons FOR SELECT
USING (public.has_course_access(auth.uid(), course_id));

-- Lesson resources: same rule
DROP POLICY IF EXISTS "Resources viewable by everyone" ON public.lesson_resources;
CREATE POLICY "Resources viewable with course access"
ON public.lesson_resources FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lessons l
    WHERE l.id = lesson_resources.lesson_id
      AND public.has_course_access(auth.uid(), l.course_id)
  )
);

-- Public curriculum preview: titles only, never content or video links
CREATE OR REPLACE FUNCTION public.get_course_curriculum(p_course_id uuid)
RETURNS TABLE (
  id uuid,
  course_id uuid,
  title text,
  description text,
  order_index integer,
  duration_minutes integer,
  has_video boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.id, l.course_id, l.title, l.description, l.order_index,
         l.duration_minutes, (l.video_url IS NOT NULL) AS has_video
  FROM public.lessons l
  WHERE l.course_id = p_course_id
  ORDER BY l.order_index;
$$;

REVOKE EXECUTE ON FUNCTION public.get_course_curriculum(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_course_curriculum(uuid) TO authenticated, anon, service_role;