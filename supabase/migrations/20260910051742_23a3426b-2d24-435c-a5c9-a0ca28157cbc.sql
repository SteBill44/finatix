
-- 1. Event log for idempotency + retry visibility
CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  environment text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  attempts integer NOT NULL DEFAULT 1,
  last_error text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

GRANT ALL ON public.payment_events TO service_role;
GRANT SELECT ON public.payment_events TO authenticated;

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment events"
  ON public.payment_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_master_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_payment_events_status ON public.payment_events(status);

-- 2. Order totals + allocations + refund/dispute state
ALTER TABLE public.course_purchases
  ADD COLUMN IF NOT EXISTS order_total integer,
  ADD COLUMN IF NOT EXISTS bundle_label text,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS disputed_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_intent_id text,
  ADD COLUMN IF NOT EXISTS charge_id text;

CREATE INDEX IF NOT EXISTS idx_course_purchases_payment_intent
  ON public.course_purchases(payment_intent_id);

-- 3. Claim / complete / fail an event (idempotency)
CREATE OR REPLACE FUNCTION public.claim_payment_event(
  p_event_id text, p_event_type text, p_environment text, p_payload jsonb DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_status text;
BEGIN
  SELECT status INTO v_status FROM public.payment_events WHERE stripe_event_id = p_event_id;

  IF v_status = 'processed' THEN
    RETURN false;
  ELSIF v_status IS NULL THEN
    INSERT INTO public.payment_events (stripe_event_id, event_type, environment, payload)
    VALUES (p_event_id, p_event_type, p_environment, p_payload)
    ON CONFLICT (stripe_event_id) DO NOTHING;
    RETURN true;
  ELSE
    UPDATE public.payment_events
    SET attempts = attempts + 1, status = 'processing', payload = coalesce(p_payload, payload)
    WHERE stripe_event_id = p_event_id;
    RETURN true;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_payment_event(p_event_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.payment_events
  SET status = 'processed', processed_at = now(), last_error = NULL
  WHERE stripe_event_id = p_event_id;
$$;

CREATE OR REPLACE FUNCTION public.fail_payment_event(p_event_id text, p_error text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.payment_events
  SET status = 'failed', last_error = p_error
  WHERE stripe_event_id = p_event_id;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_payment_event(text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_payment_event(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fail_payment_event(text, text) FROM PUBLIC, anon, authenticated;

-- 4. Transactional fulfilment
CREATE OR REPLACE FUNCTION public.fulfill_course_purchase(
  p_session_id text,
  p_environment text,
  p_user_id uuid,
  p_email text,
  p_customer_id text,
  p_price_id text,
  p_course_ids uuid[],
  p_order_total integer,
  p_currency text,
  p_bundle_label text,
  p_payment_intent_id text,
  p_grant_access boolean
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count integer := coalesce(array_length(p_course_ids, 1), 0);
  v_is_bundle boolean := v_count > 1;
  v_base integer;
  v_remainder integer;
  v_alloc integer;
  v_course_id uuid;
  v_idx integer := 0;
  v_session_key text;
  v_title text;
BEGIN
  IF v_count = 0 THEN
    RETURN 0;
  END IF;

  IF p_order_total IS NOT NULL THEN
    v_base := p_order_total / v_count;
    v_remainder := p_order_total - (v_base * v_count);
  END IF;

  FOREACH v_course_id IN ARRAY p_course_ids LOOP
    v_idx := v_idx + 1;
    v_session_key := CASE WHEN v_is_bundle THEN p_session_id || '#' || v_course_id::text ELSE p_session_id END;
    v_alloc := CASE
      WHEN p_order_total IS NULL THEN NULL
      WHEN v_idx = 1 THEN v_base + coalesce(v_remainder, 0)
      ELSE v_base
    END;

    INSERT INTO public.course_purchases (
      user_id, course_id, customer_email, stripe_session_id, stripe_customer_id,
      price_id, amount_total, order_total, currency, status, environment,
      bundle_label, payment_intent_id
    ) VALUES (
      p_user_id, v_course_id, p_email, v_session_key, p_customer_id,
      p_price_id, v_alloc, p_order_total, p_currency, 'paid', p_environment,
      p_bundle_label, p_payment_intent_id
    )
    ON CONFLICT (stripe_session_id) DO UPDATE SET
      user_id = coalesce(excluded.user_id, public.course_purchases.user_id),
      customer_email = coalesce(excluded.customer_email, public.course_purchases.customer_email),
      amount_total = excluded.amount_total,
      order_total = excluded.order_total,
      bundle_label = excluded.bundle_label,
      payment_intent_id = excluded.payment_intent_id,
      status = 'paid';

    IF p_grant_access AND p_user_id IS NOT NULL THEN
      INSERT INTO public.enrollments (user_id, course_id)
      SELECT p_user_id, v_course_id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.user_id = p_user_id AND e.course_id = v_course_id
      );
    END IF;
  END LOOP;

  IF p_grant_access AND p_user_id IS NOT NULL THEN
    IF v_is_bundle THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        p_user_id, 'success', 'Your bundle is unlocked',
        'Your payment was received and ' || coalesce(p_bundle_label, 'your bundle') ||
        ' is now unlocked (' || v_count || ' courses). Pick the course you want to start with.',
        jsonb_build_object('course_ids', to_jsonb(p_course_ids))
      );
    ELSE
      SELECT title INTO v_title FROM public.courses WHERE id = p_course_ids[1];
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        p_user_id, 'success', 'You''re enrolled',
        'Your payment was received and ' || coalesce(v_title, 'your course') ||
        ' is now unlocked. Happy studying!',
        jsonb_build_object('course_id', p_course_ids[1])
      );
    END IF;
  END IF;

  RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.fulfill_course_purchase(text, text, uuid, text, text, text, uuid[], integer, text, text, text, boolean) FROM PUBLIC, anon, authenticated;

-- 5. Refunds and disputes revoke access
CREATE OR REPLACE FUNCTION public.revoke_purchase_access(
  p_environment text,
  p_new_status text,
  p_session_id text DEFAULT NULL,
  p_payment_intent_id text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r record;
  v_affected integer := 0;
BEGIN
  FOR r IN
    UPDATE public.course_purchases p
    SET status = p_new_status,
        refunded_at = CASE WHEN p_new_status = 'refunded' THEN now() ELSE p.refunded_at END,
        disputed_at = CASE WHEN p_new_status = 'disputed' THEN now() ELSE p.disputed_at END
    WHERE p.environment = p_environment
      AND (
        (p_payment_intent_id IS NOT NULL AND p.payment_intent_id = p_payment_intent_id)
        OR (p_session_id IS NOT NULL AND (p.stripe_session_id = p_session_id
             OR p.stripe_session_id LIKE p_session_id || '#%'))
      )
    RETURNING p.user_id, p.course_id
  LOOP
    v_affected := v_affected + 1;
    IF r.user_id IS NOT NULL AND r.course_id IS NOT NULL THEN
      DELETE FROM public.enrollments e
      WHERE e.user_id = r.user_id
        AND e.course_id = r.course_id
        AND e.granted_by_admin = false
        AND NOT public.is_free_course(r.course_id);
    END IF;
  END LOOP;

  RETURN v_affected;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_purchase_access(
  p_environment text,
  p_session_id text DEFAULT NULL,
  p_payment_intent_id text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r record;
  v_affected integer := 0;
BEGIN
  FOR r IN
    UPDATE public.course_purchases p
    SET status = 'paid', disputed_at = NULL
    WHERE p.environment = p_environment
      AND p.status = 'disputed'
      AND (
        (p_payment_intent_id IS NOT NULL AND p.payment_intent_id = p_payment_intent_id)
        OR (p_session_id IS NOT NULL AND (p.stripe_session_id = p_session_id
             OR p.stripe_session_id LIKE p_session_id || '#%'))
      )
    RETURNING p.user_id, p.course_id
  LOOP
    v_affected := v_affected + 1;
    IF r.user_id IS NOT NULL AND r.course_id IS NOT NULL THEN
      INSERT INTO public.enrollments (user_id, course_id)
      SELECT r.user_id, r.course_id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.user_id = r.user_id AND e.course_id = r.course_id
      );
    END IF;
  END LOOP;

  RETURN v_affected;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.revoke_purchase_access(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restore_purchase_access(text, text, text) FROM PUBLIC, anon, authenticated;

-- 6. Refunded / disputed purchases no longer grant access
CREATE OR REPLACE FUNCTION public.has_paid_entitlement(_user_id uuid, _course_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result boolean;
  active_env text;
BEGIN
  IF _user_id IS NULL OR _course_id IS NULL THEN
    RETURN false;
  END IF;

  active_env := public.active_payments_environment();

  SELECT
    EXISTS (
      SELECT 1 FROM public.course_purchases p
      WHERE p.user_id = _user_id
        AND p.course_id = _course_id
        AND p.status IN ('paid', 'complete', 'completed')
        AND p.refunded_at IS NULL
        AND p.disputed_at IS NULL
        AND p.environment = active_env
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.user_id = _user_id
        AND e.course_id = _course_id
        AND e.granted_by_admin
    )
    OR EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND s.environment = active_env
        AND (
          (s.status IN ('active', 'trialing')
            AND (s.current_period_end IS NULL OR s.current_period_end > now()))
          OR (s.status = 'canceled' AND s.current_period_end > now())
        )
    )
  INTO result;

  RETURN coalesce(result, false);
END;
$function$;
