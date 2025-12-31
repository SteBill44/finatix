-- =====================================================
-- CERTIFICATES TABLE
-- =====================================================
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates"
ON public.certificates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert certificates"
ON public.certificates FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- DISCUSSION POSTS TABLE
-- =====================================================
CREATE TABLE public.discussion_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view discussion posts"
ON public.discussion_posts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.discussion_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.discussion_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.discussion_posts FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- DISCUSSION VOTES TABLE
-- =====================================================
CREATE TABLE public.discussion_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.discussion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes"
ON public.discussion_votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.discussion_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes"
ON public.discussion_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their votes"
ON public.discussion_votes FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- BADGES TABLE
-- =====================================================
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
ON public.badges FOR SELECT
USING (true);

CREATE POLICY "Admins can manage badges"
ON public.badges FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- USER BADGES TABLE
-- =====================================================
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all earned badges"
ON public.user_badges FOR SELECT
USING (true);

CREATE POLICY "System can award badges"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER STREAKS TABLE
-- =====================================================
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all streaks"
ON public.user_streaks FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own streaks"
ON public.user_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.user_streaks FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- COURSE REVIEWS TABLE
-- =====================================================
CREATE TABLE public.course_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON public.course_reviews FOR SELECT
USING (true);

CREATE POLICY "Enrolled users can create reviews"
ON public.course_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.course_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.course_reviews FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- LESSON RESOURCES TABLE
-- =====================================================
CREATE TABLE public.lesson_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources viewable by everyone"
ON public.lesson_resources FOR SELECT
USING (true);

CREATE POLICY "Admins can manage resources"
ON public.lesson_resources FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- EMAIL NOTIFICATIONS PREFERENCES TABLE
-- =====================================================
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  enrollment_confirmation BOOLEAN DEFAULT true,
  progress_reminders BOOLEAN DEFAULT true,
  course_completion BOOLEAN DEFAULT true,
  new_content BOOLEAN DEFAULT true,
  discussion_replies BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- AI CHAT HISTORY TABLE
-- =====================================================
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat history"
ON public.ai_chat_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat messages"
ON public.ai_chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INSERT DEFAULT BADGES
-- =====================================================
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first lesson', 'footprints', 'progress', 'lessons_completed', 1),
('Quick Learner', 'Complete 10 lessons', 'zap', 'progress', 'lessons_completed', 10),
('Knowledge Seeker', 'Complete 25 lessons', 'book-open', 'progress', 'lessons_completed', 25),
('Scholar', 'Complete 50 lessons', 'graduation-cap', 'progress', 'lessons_completed', 50),
('Quiz Starter', 'Pass your first quiz', 'circle-check', 'quiz', 'quizzes_passed', 1),
('Quiz Master', 'Pass 10 quizzes', 'trophy', 'quiz', 'quizzes_passed', 10),
('Perfect Score', 'Get 100% on any quiz', 'star', 'quiz', 'perfect_scores', 1),
('Course Champion', 'Complete your first course', 'award', 'course', 'courses_completed', 1),
('Dedicated Learner', 'Complete 3 courses', 'medal', 'course', 'courses_completed', 3),
('Streak Starter', 'Maintain a 3-day streak', 'flame', 'engagement', 'streak_days', 3),
('Week Warrior', 'Maintain a 7-day streak', 'fire', 'engagement', 'streak_days', 7),
('Monthly Master', 'Maintain a 30-day streak', 'crown', 'engagement', 'streak_days', 30),
('Discussion Pioneer', 'Create your first discussion post', 'message-circle', 'community', 'posts_created', 1),
('Helpful Hand', 'Get 5 upvotes on your answers', 'thumbs-up', 'community', 'upvotes_received', 5),
('Study Marathon', 'Study for 10 hours total', 'clock', 'time', 'study_hours', 10);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_discussion_posts_updated_at
BEFORE UPDATE ON public.discussion_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_reviews_updated_at
BEFORE UPDATE ON public.course_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- CREATE STORAGE BUCKET FOR RESOURCES
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

CREATE POLICY "Resources are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update resources"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete resources"
ON storage.objects FOR DELETE
USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'::app_role));