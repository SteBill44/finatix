
-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.is_master_admin(auth.uid()));

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_master_admin(auth.uid()));

-- announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  target_audience TEXT NOT NULL DEFAULT 'all',
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read active announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (
    is_active = true
    OR public.has_role(auth.uid(), 'admin')
    OR public.is_master_admin(auth.uid())
  );

CREATE POLICY "Admins manage announcements"
  ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_master_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_master_admin(auth.uid()));

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Broadcast helper: admin-only, inserts a notification for every user with a profile.
CREATE OR REPLACE FUNCTION public.broadcast_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_data JSONB DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.is_master_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT p.user_id, p_type, p_title, p_message, p_data
  FROM public.profiles p;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_notification(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.broadcast_notification(TEXT, TEXT, TEXT, JSONB) TO authenticated;
