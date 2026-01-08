-- 1. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_id ON quiz_attempts(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_course_id ON discussion_posts(course_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_user_id ON discussion_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_created_at ON discussion_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON ai_chat_messages(created_at DESC);

-- 2. Rate Limits Table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
  ON public.rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Performance Logs Table
CREATE TABLE IF NOT EXISTS public.performance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  path TEXT,
  duration_ms INTEGER,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_logs_event_type ON performance_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_performance_logs_created_at ON performance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_logs_path ON performance_logs(path);

ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view performance logs"
  ON public.performance_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR is_master_admin(auth.uid()));

CREATE POLICY "Anyone can insert performance logs"
  ON public.performance_logs FOR INSERT
  WITH CHECK (true);

-- 4. Optimized Analytics Function
CREATE OR REPLACE FUNCTION public.get_platform_analytics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
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
          SELECT 
            course_id,
            COUNT(*) as enrollment_count,
            COUNT(completed_at) as completion_count
          FROM enrollments
          GROUP BY course_id
        ) e ON c.id = e.course_id
        LEFT JOIN (
          SELECT 
            course_id,
            ROUND(AVG(rating)::numeric, 2) as avg_rating
          FROM course_reviews
          GROUP BY course_id
        ) r ON c.id = r.course_id
        ORDER BY c.title
      ) course_stat
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 5. Rate Limit Check Function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_per_minute INTEGER DEFAULT 20,
  p_max_per_hour INTEGER DEFAULT 100
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  minute_count INTEGER;
  hour_count INTEGER;
  result JSON;
BEGIN
  -- Count requests in last minute
  SELECT COALESCE(SUM(request_count), 0) INTO minute_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start > now() - interval '1 minute';
  
  -- Count requests in last hour
  SELECT COALESCE(SUM(request_count), 0) INTO hour_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start > now() - interval '1 hour';
  
  -- Check limits
  IF minute_count >= p_max_per_minute THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'minute_limit',
      'retryAfter', 60,
      'currentCount', minute_count
    );
  END IF;
  
  IF hour_count >= p_max_per_hour THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'hour_limit',
      'retryAfter', 3600,
      'currentCount', hour_count
    );
  END IF;
  
  -- Record this request
  INSERT INTO rate_limits (user_id, action_type, window_start, request_count)
  VALUES (p_user_id, p_action_type, date_trunc('minute', now()), 1)
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN json_build_object(
    'allowed', true,
    'minuteCount', minute_count + 1,
    'hourCount', hour_count + 1
  );
END;
$$;

-- 6. Cleanup old rate limits (older than 2 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < now() - interval '2 hours';
END;
$$;