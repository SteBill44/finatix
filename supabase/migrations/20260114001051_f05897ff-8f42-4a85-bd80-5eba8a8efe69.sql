-- Allow anyone to verify certificates by certificate number (public verification)
CREATE POLICY "Anyone can verify certificates by number" 
ON public.certificates 
FOR SELECT 
USING (true);