-- ============================================================
-- Migration: Student activity log & Content tags
-- Tables: student_activity_log, tags, lesson_tags, question_tags
-- ============================================================

-- Content tags (shared across lessons and questions)
CREATE TABLE public.tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL UNIQUE,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  category   VARCHAR(50),   -- e.g. 'topic', 'skill', 'difficulty', 'syllabus'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.lesson_tags (
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  tag_id    UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, tag_id)
);

CREATE TABLE public.question_tags (
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

-- Comprehensive student engagement log
-- Records every meaningful action: lesson views, quiz starts, downloads, etc.
CREATE TABLE public.student_activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id     UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  activity_type VARCHAR(100) NOT NULL,  -- 'lesson_view', 'quiz_start', 'quiz_complete',
                                         -- 'resource_download', 'discussion_post', 'ai_message',
                                         -- 'flashcard_review', 'video_play', 'note_save'
  entity_type   VARCHAR(50),            -- 'lesson', 'quiz', 'resource', 'discussion', 'flashcard'
  entity_id     UUID,
  metadata      JSONB,                  -- arbitrary extra data (score, duration, etc.)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tags_slug              ON public.tags(slug);
CREATE INDEX idx_tags_category          ON public.tags(category);
CREATE INDEX idx_lesson_tags_tag        ON public.lesson_tags(tag_id);
CREATE INDEX idx_question_tags_tag      ON public.question_tags(tag_id);
CREATE INDEX idx_activity_user_date     ON public.student_activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_course        ON public.student_activity_log(course_id, created_at DESC);
CREATE INDEX idx_activity_type          ON public.student_activity_log(activity_type, created_at DESC);
CREATE INDEX idx_activity_entity        ON public.student_activity_log(entity_type, entity_id);

-- RLS
ALTER TABLE public.tags                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activity_log  ENABLE ROW LEVEL SECURITY;

-- Tags: public read, admin write
CREATE POLICY "Public reads tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admin manages tags" ON public.tags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- lesson_tags / question_tags: public read, admin write
CREATE POLICY "Public reads lesson tags" ON public.lesson_tags FOR SELECT USING (true);
CREATE POLICY "Admin manages lesson tags" ON public.lesson_tags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public reads question tags" ON public.question_tags FOR SELECT USING (true);
CREATE POLICY "Admin manages question tags" ON public.question_tags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Activity log: users read own; authenticated can insert own; admin reads all
CREATE POLICY "User reads own activity" ON public.student_activity_log
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "User inserts own activity" ON public.student_activity_log
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin reads all activity" ON public.student_activity_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
