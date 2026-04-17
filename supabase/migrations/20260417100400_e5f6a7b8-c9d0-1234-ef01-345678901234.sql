-- ============================================================
-- Migration: Announcements & Notifications inbox
-- Tables: announcements, announcement_reads, notifications
-- ============================================================

CREATE TABLE public.announcements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  type            VARCHAR(50) NOT NULL DEFAULT 'info'
                    CHECK (type IN ('info', 'warning', 'success', 'urgent')),
  target_audience VARCHAR(50) NOT NULL DEFAULT 'all'
                    CHECK (target_audience IN ('all', 'enrolled', 'admins', 'course_specific')),
  course_id       UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track which users have read which announcements
CREATE TABLE public.announcement_reads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id  UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  read_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, announcement_id)
);

-- General notifications inbox per user
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       VARCHAR(100) NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT,
  data       JSONB,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_announcements_published   ON public.announcements(is_published, published_at DESC)
  WHERE is_published = TRUE;
CREATE INDEX idx_announcements_course      ON public.announcements(course_id)
  WHERE course_id IS NOT NULL;
CREATE INDEX idx_announcements_expires     ON public.announcements(expires_at)
  WHERE expires_at IS NOT NULL;
CREATE INDEX idx_announcement_reads_user   ON public.announcement_reads(user_id, announcement_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, created_at DESC)
  WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user_all    ON public.notifications(user_id, created_at DESC);

-- RLS
ALTER TABLE public.announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;

-- Announcements: published ones visible to authenticated users; admin sees all
CREATE POLICY "Authenticated read published announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (
    is_published = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admin manages announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Announcement reads: users manage their own
CREATE POLICY "User manages own reads" ON public.announcement_reads
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin views all reads" ON public.announcement_reads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Notifications: users own their records; system can insert via service role
CREATE POLICY "User reads own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "User updates own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin views all notifications" ON public.notifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
