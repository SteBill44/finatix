-- ============================================================
-- Migration: Flashcard system
-- Tables: flashcard_decks, flashcard_cards, flashcard_progress
-- ============================================================

CREATE TABLE public.flashcard_decks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id           UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  course_id           UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  card_count          INTEGER NOT NULL DEFAULT 0,
  is_system_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.flashcard_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id         UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front           TEXT NOT NULL,
  back            TEXT NOT NULL,
  hint            TEXT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  times_shown     INTEGER NOT NULL DEFAULT 0,
  times_correct   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spaced-repetition progress per user per card
CREATE TABLE public.flashcard_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id         UUID NOT NULL REFERENCES public.flashcard_cards(id) ON DELETE CASCADE,
  deck_id         UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  ease_factor     DECIMAL(4,2) NOT NULL DEFAULT 2.5,  -- SM-2 algorithm ease factor
  interval_days   INTEGER NOT NULL DEFAULT 1,
  repetitions     INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Indexes
CREATE INDEX idx_flashcard_decks_user     ON public.flashcard_decks(user_id);
CREATE INDEX idx_flashcard_decks_course   ON public.flashcard_decks(course_id);
CREATE INDEX idx_flashcard_decks_lesson   ON public.flashcard_decks(lesson_id);
CREATE INDEX idx_flashcard_cards_deck     ON public.flashcard_cards(deck_id, order_index);
CREATE INDEX idx_flashcard_progress_user  ON public.flashcard_progress(user_id, next_review_at);
CREATE INDEX idx_flashcard_progress_deck  ON public.flashcard_progress(user_id, deck_id);

-- RLS
ALTER TABLE public.flashcard_decks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_cards    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_progress ENABLE ROW LEVEL SECURITY;

-- flashcard_decks: owner + admin see all; system decks visible to enrolled users
CREATE POLICY "User sees own and system decks" ON public.flashcard_decks
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_system_generated = TRUE
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "User creates own decks" ON public.flashcard_decks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User updates own decks" ON public.flashcard_decks
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "User deletes own decks" ON public.flashcard_decks
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin manages system decks" ON public.flashcard_decks
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- flashcard_cards: visible if deck is visible
CREATE POLICY "Cards readable with deck" ON public.flashcard_cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks d
      WHERE d.id = deck_id
        AND (d.user_id = auth.uid() OR d.is_system_generated = TRUE OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Owner or admin manages cards" ON public.flashcard_cards
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks d
      WHERE d.id = deck_id
        AND (d.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- flashcard_progress: users manage their own
CREATE POLICY "User manages own progress" ON public.flashcard_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin views all progress" ON public.flashcard_progress
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Keep card_count in sync
CREATE OR REPLACE FUNCTION public.update_flashcard_deck_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.flashcard_decks SET card_count = card_count + 1, updated_at = NOW()
      WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.flashcard_decks SET card_count = GREATEST(0, card_count - 1), updated_at = NOW()
      WHERE id = OLD.deck_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_flashcard_card_count
  AFTER INSERT OR DELETE ON public.flashcard_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_flashcard_deck_count();
