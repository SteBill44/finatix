-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all streaks" ON public.user_streaks;

-- Create a more restrictive policy - users can only view their own streaks
CREATE POLICY "Users can view their own streaks"
ON public.user_streaks
FOR SELECT
USING (auth.uid() = user_id);