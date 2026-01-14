-- Create admin_audit_logs table for tracking all admin actions
CREATE TABLE public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL, -- e.g., 'create', 'update', 'delete'
  entity_type TEXT NOT NULL, -- e.g., 'course', 'lesson', 'user', 'quiz'
  entity_id UUID, -- The ID of the affected entity
  entity_name TEXT, -- Human-readable name for the entity
  old_values JSONB, -- Previous state (for updates)
  new_values JSONB, -- New state (for creates/updates)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_admin_audit_logs_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_admin_audit_logs_created ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

-- Only admins can insert audit logs (when performing actions)
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

-- Create function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT (has_role(auth.uid(), 'admin') OR is_master_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'totalUsers', (SELECT COUNT(DISTINCT user_id) FROM profiles),
    'totalEnrollments', (SELECT COUNT(*) FROM enrollments),
    'totalCourses', (SELECT COUNT(*) FROM courses),
    'totalLessons', (SELECT COUNT(*) FROM lessons),
    'totalQuizzes', (SELECT COUNT(*) FROM quizzes),
    'totalCompletions', (SELECT COUNT(*) FROM enrollments WHERE completed_at IS NOT NULL),
    'totalCertificates', (SELECT COUNT(*) FROM certificates),
    'totalReviews', (SELECT COUNT(*) FROM course_reviews),
    'activeStudentsToday', (
      SELECT COUNT(DISTINCT user_id) 
      FROM lesson_progress 
      WHERE completed_at >= CURRENT_DATE
    ),
    'newUsersThisWeek', (
      SELECT COUNT(*) 
      FROM profiles 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'enrollmentsTrend', (
      SELECT COALESCE(json_agg(trend ORDER BY date), '[]'::json)
      FROM (
        SELECT 
          DATE(enrolled_at) as date,
          COUNT(*) as count
        FROM enrollments
        WHERE enrolled_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(enrolled_at)
      ) trend
    ),
    'topCourses', (
      SELECT COALESCE(json_agg(course_stat), '[]'::json)
      FROM (
        SELECT 
          c.id,
          c.title,
          c.level,
          COALESCE(e.enrollment_count, 0) as enrollments,
          COALESCE(r.avg_rating, 0) as rating
        FROM courses c
        LEFT JOIN (
          SELECT course_id, COUNT(*) as enrollment_count
          FROM enrollments
          GROUP BY course_id
        ) e ON c.id = e.course_id
        LEFT JOIN (
          SELECT course_id, ROUND(AVG(rating)::numeric, 1) as avg_rating
          FROM course_reviews
          GROUP BY course_id
        ) r ON c.id = r.course_id
        ORDER BY e.enrollment_count DESC NULLS LAST
        LIMIT 5
      ) course_stat
    ),
    'recentActivity', (
      SELECT COALESCE(json_agg(activity ORDER BY created_at DESC), '[]'::json)
      FROM (
        SELECT 
          id,
          action,
          entity_type,
          entity_name,
          created_at,
          admin_user_id
        FROM admin_audit_logs
        ORDER BY created_at DESC
        LIMIT 10
      ) activity
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Fix overly permissive RLS policies by making them more specific

-- Fix usage_metrics - restrict to authenticated users for insert, admin only for update
DROP POLICY IF EXISTS "System can insert usage metrics" ON usage_metrics;
DROP POLICY IF EXISTS "System can update usage metrics" ON usage_metrics;

CREATE POLICY "Authenticated can insert usage metrics" ON usage_metrics
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update usage metrics" ON usage_metrics
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

-- Fix cost_estimates - restrict to admin only
DROP POLICY IF EXISTS "System can insert cost estimates" ON cost_estimates;
DROP POLICY IF EXISTS "System can update cost estimates" ON cost_estimates;

CREATE POLICY "Admins can insert cost estimates" ON cost_estimates
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

CREATE POLICY "Admins can update cost estimates" ON cost_estimates
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

-- Fix performance_logs - require authentication
DROP POLICY IF EXISTS "Anyone can insert performance logs" ON performance_logs;

CREATE POLICY "Authenticated can insert performance logs" ON performance_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);