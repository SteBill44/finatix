-- Migration: Add new tables for flashcards, study planner, and corporate partnerships

-- Enhance lesson_resources with resource type and course-level flag
ALTER TABLE lesson_resources 
ADD COLUMN IF NOT EXISTS resource_type text DEFAULT 'document',
ADD COLUMN IF NOT EXISTS is_course_level boolean DEFAULT false;

-- Flashcard decks (can be auto-generated from lessons or user-created)
CREATE TABLE flashcard_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  is_system_generated boolean DEFAULT false,
  card_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual flashcards
CREATE TABLE flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User progress per card (SM-2 algorithm data)
CREATE TABLE flashcard_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  flashcard_id uuid REFERENCES flashcards(id) ON DELETE CASCADE,
  ease_factor decimal DEFAULT 2.5,
  interval_days integer DEFAULT 0,
  repetitions integer DEFAULT 0,
  next_review timestamptz DEFAULT now(),
  last_review timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, flashcard_id)
);

-- User study plans
CREATE TABLE study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  exam_date date NOT NULL,
  target_study_hours_per_week integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Daily/weekly goals
CREATE TABLE study_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES study_plans(id) ON DELETE CASCADE,
  date date NOT NULL,
  target_minutes integer NOT NULL,
  actual_minutes integer DEFAULT 0,
  lessons_target jsonb DEFAULT '[]',
  lessons_completed jsonb DEFAULT '[]',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Corporate accounts
CREATE TABLE corporate_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_email text NOT NULL,
  contact_name text,
  phone text,
  employee_count integer,
  status text DEFAULT 'inquiry',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Corporate enrollments linking employees to corporate accounts
CREATE TABLE corporate_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id uuid REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  enrolled_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_enrollments ENABLE ROW LEVEL SECURITY;

-- Flashcard decks policies
CREATE POLICY "Users can view their own decks" ON flashcard_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own decks" ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own decks" ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own decks" ON flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- Flashcards policies (access through deck ownership)
CREATE POLICY "Users can view cards in their decks" ON flashcards FOR SELECT 
  USING (EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid()));
CREATE POLICY "Users can create cards in their decks" ON flashcards FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid()));
CREATE POLICY "Users can update cards in their decks" ON flashcards FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete cards in their decks" ON flashcards FOR DELETE 
  USING (EXISTS (SELECT 1 FROM flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid()));

-- Flashcard progress policies
CREATE POLICY "Users can view their own progress" ON flashcard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON flashcard_progress FOR UPDATE USING (auth.uid() = user_id);

-- Study plans policies
CREATE POLICY "Users can view their own plans" ON study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own plans" ON study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plans" ON study_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plans" ON study_plans FOR DELETE USING (auth.uid() = user_id);

-- Study goals policies (access through plan ownership)
CREATE POLICY "Users can view goals in their plans" ON study_goals FOR SELECT 
  USING (EXISTS (SELECT 1 FROM study_plans WHERE id = study_goals.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can create goals in their plans" ON study_goals FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM study_plans WHERE id = study_goals.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can update goals in their plans" ON study_goals FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM study_plans WHERE id = study_goals.plan_id AND user_id = auth.uid()));

-- Corporate accounts policies
CREATE POLICY "Anyone can submit corporate inquiry" ON corporate_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view corporate accounts" ON corporate_accounts FOR SELECT 
  USING (has_role(auth.uid(), 'admin') OR is_master_admin(auth.uid()));
CREATE POLICY "Admins can update corporate accounts" ON corporate_accounts FOR UPDATE 
  USING (has_role(auth.uid(), 'admin') OR is_master_admin(auth.uid()));
CREATE POLICY "Admins can delete corporate accounts" ON corporate_accounts FOR DELETE 
  USING (has_role(auth.uid(), 'admin') OR is_master_admin(auth.uid()));

-- Corporate enrollments policies
CREATE POLICY "Admins can manage corporate enrollments" ON corporate_enrollments FOR ALL 
  USING (has_role(auth.uid(), 'admin') OR is_master_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_flashcard_decks_updated_at BEFORE UPDATE ON flashcard_decks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_plans_updated_at BEFORE UPDATE ON study_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_corporate_accounts_updated_at BEFORE UPDATE ON corporate_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update flashcard deck card count
CREATE OR REPLACE FUNCTION update_deck_card_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE flashcard_decks SET card_count = card_count + 1 WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE flashcard_decks SET card_count = card_count - 1 WHERE id = OLD.deck_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_deck_card_count_trigger
AFTER INSERT OR DELETE ON flashcards
FOR EACH ROW EXECUTE FUNCTION update_deck_card_count();