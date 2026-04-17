-- ============================================================
-- Migration: Payments, Subscriptions & Invoices
-- Also adds expires_at / access_type to enrollments
-- ============================================================

-- Subscriptions (must exist before payments FK)
CREATE TABLE public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                    VARCHAR(50) NOT NULL CHECK (plan IN ('monthly', 'annual', 'lifetime')),
  status                  VARCHAR(20) NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'cancelled', 'expired', 'paused', 'trial')),
  stripe_subscription_id  VARCHAR(255),
  stripe_customer_id      VARCHAR(255),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  trial_ends_at           TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE public.payments (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id                    UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  subscription_id              UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount                       DECIMAL(10,2) NOT NULL,
  currency                     VARCHAR(3) NOT NULL DEFAULT 'GBP',
  payment_method               VARCHAR(50),
  status                       VARCHAR(20) NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  stripe_payment_intent_id     VARCHAR(255),
  stripe_checkout_session_id   VARCHAR(255),
  metadata                     JSONB,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at                 TIMESTAMPTZ
);

-- Invoices
CREATE TABLE public.invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id        UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  subscription_id   UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount            DECIMAL(10,2) NOT NULL,
  currency          VARCHAR(3) NOT NULL DEFAULT 'GBP',
  status            VARCHAR(20) NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  stripe_invoice_id VARCHAR(255),
  pdf_url           TEXT,
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at            TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add access control to enrollments
ALTER TABLE public.enrollments
  ADD COLUMN expires_at   TIMESTAMPTZ,
  ADD COLUMN access_type  VARCHAR(50) NOT NULL DEFAULT 'lifetime'
    CHECK (access_type IN ('lifetime', 'subscription', 'timed'));

-- Indexes
CREATE INDEX idx_subscriptions_user        ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status      ON public.subscriptions(status, current_period_end);
CREATE INDEX idx_subscriptions_stripe      ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_payments_user             ON public.payments(user_id);
CREATE INDEX idx_payments_status           ON public.payments(status, created_at DESC);
CREATE INDEX idx_payments_stripe_intent    ON public.payments(stripe_payment_intent_id);
CREATE INDEX idx_invoices_user             ON public.invoices(user_id);
CREATE INDEX idx_invoices_subscription     ON public.invoices(subscription_id);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices        ENABLE ROW LEVEL SECURITY;

-- Subscriptions
CREATE POLICY "User views own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admin views all subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manages subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Payments
CREATE POLICY "User views own payments" ON public.payments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admin views all payments" ON public.payments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manages payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Invoices
CREATE POLICY "User views own invoices" ON public.invoices
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admin views all invoices" ON public.invoices
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manages invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Helper: check if user has active subscription or relevant paid enrollment
CREATE OR REPLACE FUNCTION public.has_course_access(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = _user_id
      AND e.course_id = _course_id
      AND (e.expires_at IS NULL OR e.expires_at > NOW())
  )
  OR EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = _user_id
      AND s.status IN ('active', 'trial')
      AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  )
  OR public.has_role(_user_id, 'admin');
$$;
