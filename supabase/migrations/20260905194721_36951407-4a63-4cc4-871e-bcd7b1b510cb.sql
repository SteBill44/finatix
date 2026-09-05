CREATE TABLE public.course_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  stripe_session_id text NOT NULL UNIQUE,
  stripe_customer_id text,
  price_id text,
  amount_total integer,
  currency text,
  status text NOT NULL DEFAULT 'paid',
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.course_purchases TO authenticated;
GRANT ALL ON public.course_purchases TO service_role;

ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON public.course_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.is_master_admin(auth.uid()));

CREATE INDEX idx_course_purchases_user ON public.course_purchases(user_id);
CREATE INDEX idx_course_purchases_course ON public.course_purchases(course_id);