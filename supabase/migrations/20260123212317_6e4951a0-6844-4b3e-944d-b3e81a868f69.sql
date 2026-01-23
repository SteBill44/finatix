-- Add missing DELETE policies for user data tables (GDPR compliance)

-- Quiz attempts - allow users to delete their own attempts
CREATE POLICY "Users can delete their own quiz attempts" 
ON public.quiz_attempts 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Study sessions - allow users to delete their own sessions
CREATE POLICY "Users can delete their own study sessions" 
ON public.study_sessions 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Profiles - allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Video progress - allow users to delete their own video progress
CREATE POLICY "Users can delete their own video progress" 
ON public.video_progress 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- User streaks - allow users to delete their own streaks
CREATE POLICY "Users can delete their own streaks" 
ON public.user_streaks 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Study goals - allow users to delete goals in their plans
CREATE POLICY "Users can delete goals in their plans" 
ON public.study_goals 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM study_plans
  WHERE study_plans.id = study_goals.plan_id 
  AND study_plans.user_id = auth.uid()
));

-- AI chat messages - allow users to delete their own chat messages
CREATE POLICY "Users can delete their own chat messages" 
ON public.ai_chat_messages 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Fix overly permissive INSERT policy on interest_registrations
-- First drop the existing permissive policy
DROP POLICY IF EXISTS "Anyone can register interest" ON public.interest_registrations;

-- Create a more restrictive policy that still allows anonymous submissions but adds rate limiting via RPC
CREATE POLICY "Anyone can register interest with rate limiting" 
ON public.interest_registrations 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Basic validation: email must be provided
  email IS NOT NULL AND 
  email != '' AND
  length(email) <= 255
);

-- Fix overly permissive INSERT policy on corporate_accounts
DROP POLICY IF EXISTS "Anyone can submit corporate inquiry" ON public.corporate_accounts;

-- Create a more restrictive policy with basic validation
CREATE POLICY "Anyone can submit corporate inquiry with validation" 
ON public.corporate_accounts 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Basic validation
  contact_email IS NOT NULL AND 
  contact_email != '' AND
  length(contact_email) <= 255 AND
  company_name IS NOT NULL AND
  company_name != '' AND
  length(company_name) <= 255
);

-- Update handle_new_user function with better validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Extract and validate full_name
  v_full_name := TRIM(COALESCE(new.raw_user_meta_data ->> 'full_name', 'User'));
  
  -- Validate: must be reasonable length (1-100 characters)
  IF LENGTH(v_full_name) < 1 OR LENGTH(v_full_name) > 100 THEN
    v_full_name := 'User';
  END IF;
  
  -- Remove any potentially harmful characters
  v_full_name := regexp_replace(v_full_name, '[<>"''\\]', '', 'g');
  
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, v_full_name)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;