import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FlashcardDeck {
  id: string;
  user_id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string | null;
  card_count: number | null;
  is_system_generated: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  course?: { title: string; slug: string } | null;
}

export interface Flashcard {
  id: string;
  deck_id: string | null;
  front: string;
  back: string;
  order_index: number | null;
  created_at: string | null;
  progress?: FlashcardProgress | null;
}

export interface FlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string | null;
  ease_factor: number | null;
  interval_days: number | null;
  repetitions: number | null;
  last_review: string | null;
  next_review: string | null;
}

export const useFlashcardDecks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["flashcard_decks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcard_decks")
        .select(`
          *,
          course:courses(title, slug)
        `)
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data || []) as FlashcardDeck[];
    },
    enabled: !!user,
  });
};

export const useSystemFlashcardDecks = () => {
  return useQuery({
    queryKey: ["flashcard_decks_system"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcard_decks")
        .select(`
          *,
          course:courses(title, slug)
        `)
        .eq("is_system_generated", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as FlashcardDeck[];
    },
  });
};

export const useFlashcards = (deckId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["flashcards", deckId, user?.id],
    queryFn: async () => {
      const { data: cards, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .order("order_index");

      if (error) throw error;

      if (!cards || cards.length === 0) return [] as Flashcard[];

      const cardIds = cards.map((c) => c.id);
      const { data: progressData } = await supabase
        .from("flashcard_progress")
        .select("*")
        .eq("user_id", user!.id)
        .in("flashcard_id", cardIds);

      const progressMap = new Map(
        (progressData || []).map((p) => [p.flashcard_id, p])
      );

      return cards.map((card) => ({
        ...card,
        progress: progressMap.get(card.id) || null,
      })) as Flashcard[];
    },
    enabled: !!deckId && !!user,
  });
};

export const useCreateFlashcardDeck = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      courseId,
    }: {
      title: string;
      description?: string;
      courseId?: string;
    }) => {
      const { data, error } = await supabase
        .from("flashcard_decks")
        .insert({
          user_id: user!.id,
          title,
          description: description || null,
          course_id: courseId || null,
          is_system_generated: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard_decks"] });
    },
  });
};

export const useAddFlashcard = (deckId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ front, back }: { front: string; back: string }) => {
      const { data: existing } = await supabase
        .from("flashcards")
        .select("order_index")
        .eq("deck_id", deckId)
        .order("order_index", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextIndex = (existing?.order_index ?? -1) + 1;

      const { data, error } = await supabase
        .from("flashcards")
        .insert({ deck_id: deckId, front, back, order_index: nextIndex })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["flashcard_decks"] });
    },
  });
};

// SM-2 spaced repetition algorithm
function sm2(
  quality: number, // 0-5 (0=again, 3=hard, 4=good, 5=easy)
  easeFactor: number,
  interval: number,
  repetitions: number
): { easeFactor: number; interval: number; repetitions: number } {
  if (quality < 3) {
    return { easeFactor, interval: 1, repetitions: 0 };
  }
  const newEF = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let newInterval: number;
  if (repetitions === 0) newInterval = 1;
  else if (repetitions === 1) newInterval = 6;
  else newInterval = Math.round(interval * newEF);

  return { easeFactor: newEF, interval: newInterval, repetitions: repetitions + 1 };
}

export const useRecordFlashcardReview = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      flashcardId,
      quality,
      existingProgress,
    }: {
      flashcardId: string;
      quality: number;
      existingProgress: FlashcardProgress | null;
    }) => {
      const ef = existingProgress?.ease_factor ?? 2.5;
      const interval = existingProgress?.interval_days ?? 0;
      const reps = existingProgress?.repetitions ?? 0;
      const { easeFactor, interval: newInterval, repetitions } = sm2(quality, ef, interval, reps);
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + newInterval);

      if (existingProgress?.id) {
        const { error } = await supabase
          .from("flashcard_progress")
          .update({
            ease_factor: easeFactor,
            interval_days: newInterval,
            repetitions,
            last_review: new Date().toISOString(),
            next_review: nextReview.toISOString(),
          })
          .eq("id", existingProgress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("flashcard_progress").insert({
          user_id: user!.id,
          flashcard_id: flashcardId,
          ease_factor: easeFactor,
          interval_days: newInterval,
          repetitions,
          last_review: new Date().toISOString(),
          next_review: nextReview.toISOString(),
        });
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });
};
