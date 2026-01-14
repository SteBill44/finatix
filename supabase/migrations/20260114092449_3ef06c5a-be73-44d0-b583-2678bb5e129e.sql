-- Create storage bucket for lesson videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-videos', 
  'lesson-videos', 
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated admins to upload videos
CREATE POLICY "Admins can upload lesson videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-videos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admins to update videos
CREATE POLICY "Admins can update lesson videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-videos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admins to delete videos
CREATE POLICY "Admins can delete lesson videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-videos' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow public read access to videos
CREATE POLICY "Public can view lesson videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lesson-videos');

-- Add video_url column to lessons table if not exists
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS video_url TEXT;