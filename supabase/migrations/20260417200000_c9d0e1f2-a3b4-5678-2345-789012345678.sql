-- ============================================================
-- Security fixes migration
-- 1. Admin full-access policy on quiz_questions (write ops)
-- 2. Restrict user_badges, user_streaks, discussion_votes
--    from world-readable to own-only + admin
-- ============================================================

-- 1. Admin write access to quiz_questions (was missing entirely)
CREATE POLICY "Admins can manage quiz questions"
ON public.quiz_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin also needs to directly SELECT for the question management UI
CREATE POLICY "Admins can view all quiz questions"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2a. user_badges: drop world-readable, replace with own-only + admin
DROP POLICY IF EXISTS "Users can view all earned badges" ON public.user_badges;

CREATE POLICY "Users view own badges" ON public.user_badges
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins view all badges" ON public.user_badges
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2b. user_streaks: drop world-readable, replace with own-only + admin
DROP POLICY IF EXISTS "Users can view all streaks" ON public.user_streaks;

CREATE POLICY "Users view own streak" ON public.user_streaks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins view all streaks" ON public.user_streaks
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2c. discussion_votes: drop anonymous read, restrict to authenticated
DROP POLICY IF EXISTS "Users can view votes" ON public.discussion_votes;

CREATE POLICY "Authenticated users view votes" ON public.discussion_votes
  FOR SELECT TO authenticated
  USING (true);
