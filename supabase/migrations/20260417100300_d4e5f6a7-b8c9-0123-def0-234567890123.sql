-- ============================================================
-- Migration: Learning Paths & Course Prerequisites
-- Tables: course_prerequisites, learning_paths,
--         learning_path_courses, user_learning_paths
-- ============================================================

-- Prerequisites (e.g. BA1 must be done before BA2)
CREATE TABLE public.course_prerequisites (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id             UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  is_required           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, prerequisite_course_id),
  CHECK (course_id != prerequisite_course_id)
);

-- Curated learning paths (e.g. "Full CIMA Operational Level")
CREATE TABLE public.learning_paths (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  slug            VARCHAR(255) UNIQUE,
  image_url       TEXT,
  estimated_hours INTEGER,
  level           VARCHAR(50),
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  order_index     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Which courses belong to a path, in what order
CREATE TABLE public.learning_path_courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id     UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(path_id, course_id)
);

-- User enrolment on a learning path
CREATE TABLE public.user_learning_paths (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id      UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, path_id)
);

-- Indexes
CREATE INDEX idx_course_prereqs_course  ON public.course_prerequisites(course_id);
CREATE INDEX idx_course_prereqs_prereq  ON public.course_prerequisites(prerequisite_course_id);
CREATE INDEX idx_learning_paths_slug    ON public.learning_paths(slug) WHERE is_published = TRUE;
CREATE INDEX idx_lp_courses_path        ON public.learning_path_courses(path_id, order_index);
CREATE INDEX idx_user_lp_user           ON public.user_learning_paths(user_id);

-- RLS
ALTER TABLE public.course_prerequisites  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_courses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_paths    ENABLE ROW LEVEL SECURITY;

-- course_prerequisites
CREATE POLICY "Public read prerequisites" ON public.course_prerequisites
  FOR SELECT USING (true);

CREATE POLICY "Admin manages prerequisites" ON public.course_prerequisites
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- learning_paths
CREATE POLICY "Public reads published paths" ON public.learning_paths
  FOR SELECT USING (is_published = TRUE OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manages paths" ON public.learning_paths
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- learning_path_courses
CREATE POLICY "Public reads path courses" ON public.learning_path_courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths lp
      WHERE lp.id = path_id AND (lp.is_published = TRUE OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admin manages path courses" ON public.learning_path_courses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_learning_paths
CREATE POLICY "User manages own path progress" ON public.user_learning_paths
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin views all path progress" ON public.user_learning_paths
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function: check whether a user meets prerequisites for a course
CREATE OR REPLACE FUNCTION public.user_meets_prerequisites(_user_id uuid, _course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.course_prerequisites cp
    WHERE cp.course_id = _course_id
      AND cp.is_required = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.user_id = _user_id
          AND e.course_id = cp.prerequisite_course_id
          AND e.completed_at IS NOT NULL
      )
  );
$$;
