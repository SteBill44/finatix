-- Create table for interest registrations
CREATE TABLE public.interest_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interest_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public registration form)
CREATE POLICY "Anyone can register interest" 
ON public.interest_registrations 
FOR INSERT 
WITH CHECK (true);

-- Only allow viewing own registration (via email match - for future use)
CREATE POLICY "Registrations are not publicly viewable" 
ON public.interest_registrations 
FOR SELECT 
USING (false);