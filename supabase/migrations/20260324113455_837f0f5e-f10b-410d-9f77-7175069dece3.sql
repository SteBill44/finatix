
CREATE TABLE public.site_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  image_url text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON public.site_images FOR SELECT USING (true);

CREATE POLICY "Admin insert" ON public.site_images FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update" ON public.site_images FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin delete" ON public.site_images FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
