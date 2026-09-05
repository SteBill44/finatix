ALTER TABLE public.course_purchases ADD COLUMN IF NOT EXISTS customer_email text;
CREATE INDEX IF NOT EXISTS idx_course_purchases_customer_email ON public.course_purchases (lower(customer_email)) WHERE user_id IS NULL;

CREATE OR REPLACE FUNCTION public.claim_guest_purchases()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_email text;
  v_claimed integer := 0;
  r record;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_user_id;
  IF v_email IS NULL THEN
    RETURN 0;
  END IF;

  FOR r IN
    UPDATE public.course_purchases
    SET user_id = v_user_id
    WHERE user_id IS NULL
      AND status = 'paid'
      AND lower(customer_email) = v_email
    RETURNING course_id
  LOOP
    v_claimed := v_claimed + 1;
    IF r.course_id IS NOT NULL THEN
      INSERT INTO public.enrollments (user_id, course_id)
      SELECT v_user_id, r.course_id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.user_id = v_user_id AND e.course_id = r.course_id
      );
    END IF;
  END LOOP;

  RETURN v_claimed;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_guest_purchases() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_guest_purchases() TO authenticated;