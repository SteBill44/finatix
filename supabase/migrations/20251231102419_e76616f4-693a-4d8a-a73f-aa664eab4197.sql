-- Create a function to check if user is master_admin
CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'master_admin'::app_role
  )
$$;

-- Update user_roles policies to allow master_admin full control
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

-- Master admin and admin can view all roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid())
);

-- Only master_admin can insert/update/delete roles
CREATE POLICY "Master admin can insert user roles" ON public.user_roles
FOR INSERT WITH CHECK (is_master_admin(auth.uid()));

CREATE POLICY "Master admin can update user roles" ON public.user_roles
FOR UPDATE USING (is_master_admin(auth.uid()));

CREATE POLICY "Master admin can delete user roles" ON public.user_roles
FOR DELETE USING (is_master_admin(auth.uid()));

-- Update profiles policy to allow admins to view all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid())
);

-- Assign master_admin role to the user (Steven Billington)
INSERT INTO public.user_roles (user_id, role)
VALUES ('dd9ad0d1-b483-4bd9-b16c-5b4fa31de108', 'master_admin')
ON CONFLICT (user_id, role) DO NOTHING;