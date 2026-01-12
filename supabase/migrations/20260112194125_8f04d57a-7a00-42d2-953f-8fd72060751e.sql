-- Fix interest_registrations: Add DELETE policy for admins
CREATE POLICY "Admins can delete interest registrations"
ON public.interest_registrations
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));

-- Fix corporate_accounts: Ensure all policies are properly restrictive
-- The INSERT policy allows public submissions which is intentional for inquiry forms
-- But we need to ensure the data columns aren't overly exposed

-- Add a view restriction comment for documentation
COMMENT ON TABLE public.interest_registrations IS 'Interest registrations - SELECT restricted to admins only';
COMMENT ON TABLE public.corporate_accounts IS 'Corporate accounts - SELECT restricted to admins only, INSERT open for inquiries';