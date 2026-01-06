-- Add course_id column to interest_registrations for tracking course-specific interests
ALTER TABLE interest_registrations 
ADD COLUMN course_id uuid REFERENCES courses(id);

-- Update RLS policy to allow admins to view interest registrations
DROP POLICY IF EXISTS "Registrations are not publicly viewable" ON interest_registrations;

CREATE POLICY "Admins can view interest registrations" 
ON interest_registrations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR is_master_admin(auth.uid()));