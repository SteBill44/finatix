-- Create audit log table for sensitive data access
CREATE TABLE IF NOT EXISTS public.profile_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by UUID NOT NULL,
  profile_user_id UUID NOT NULL,
  access_type TEXT NOT NULL DEFAULT 'view',
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on audit log table
ALTER TABLE public.profile_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins/master_admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.profile_access_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR is_master_admin(auth.uid()));

-- System can insert audit logs (using security definer function)
CREATE POLICY "System inserts audit logs"
ON public.profile_access_logs
FOR INSERT
WITH CHECK (auth.uid() = accessed_by);

-- Create index for efficient querying
CREATE INDEX idx_profile_access_logs_accessed_at ON public.profile_access_logs(accessed_at DESC);
CREATE INDEX idx_profile_access_logs_profile_user_id ON public.profile_access_logs(profile_user_id);
CREATE INDEX idx_profile_access_logs_accessed_by ON public.profile_access_logs(accessed_by);

-- Create a security definer function to log profile access when admins view other users' profiles
CREATE OR REPLACE FUNCTION public.log_profile_access(
  p_profile_user_id UUID,
  p_access_type TEXT DEFAULT 'view'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if accessing someone else's profile
  IF p_profile_user_id != auth.uid() THEN
    INSERT INTO public.profile_access_logs (accessed_by, profile_user_id, access_type)
    VALUES (auth.uid(), p_profile_user_id, p_access_type);
  END IF;
END;
$$;

-- Create a wrapper function for admins to view profiles with audit logging
CREATE OR REPLACE FUNCTION public.get_user_profile_with_audit(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  cima_id TEXT,
  cima_start_date DATE,
  cima_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin or master_admin
  IF NOT (has_role(auth.uid(), 'admin') OR is_master_admin(auth.uid())) THEN
    -- Regular users can only view their own profile
    IF p_user_id != auth.uid() THEN
      RAISE EXCEPTION 'Access denied: Cannot view other users profiles';
    END IF;
  ELSE
    -- Log admin access to other users' profiles
    IF p_user_id != auth.uid() THEN
      PERFORM log_profile_access(p_user_id, 'admin_view');
    END IF;
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.full_name,
    p.avatar_url,
    p.cima_id,
    p.cima_start_date,
    p.cima_end_date,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
END;
$$;