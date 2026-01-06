import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateNextReview, uiRatingToSM2Quality, type FlashcardProgress } from "@/lib/sm2";

export interface FlashcardDeck {
  id: string;
  user_id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string | null;
  is_system_generated: boolean;
  card_count: number;
  created_at: string;
  updated_at: string;
  courses?: { title: string; slug: string } | null;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  order_index: number;
  created_at: string;
  progress?: FlashcardProgressRecord | null;
}

export interface FlashcardProgressRecord {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_review: string | null;
}

// Get all decks for the current user
export const useFlashcardDecks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["flashcard-decks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcard_decks")
        .select(`
          *,
          courses (title, slug)
        `)
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data as FlashcardDeck[];
    },
    enabled: !!user,
  });
};

// Get a single deck with its cards
export const useFlashcardDeck = (deckId: string | undefined) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["flashcard-deck", deckId],
    queryFn: async () => {
      const { data: deck, error: deckError } = await supabase
        .from("flashcard_decks")
        .select(`*, courses (title, slug)`)
        .eq("id", deckId!)
        .single();
      
      if (deckError) throw deckError;
      
      const { data: cards, error: cardsError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId!)
        .order("order_index");
      
      if (cardsError) throw cardsError;
      
      // Get progress for each card
      const { data: progress } = await supabase
        .from("flashcard_progress")
        .select("*")
        .eq("user_id", user!.id)
        .in("flashcard_id", cards.map(c => c.id));
      
      const progressMap = new Map(progress?.map(p => [p.flashcard_id, p]) || []);
      
      const cardsWithProgress = cards.map(card => ({
        ...card,
        progress: progressMap.get(card.id) || null,
      }));
      
      return { deck: deck as FlashcardDeck, cards: cardsWithProgress as Flashcard[] };
    },
    enabled: !!deckId && !!user,
  });
};

// Get due cards count across all decks
export const useDueCardsCount = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["due-cards-count", user?.id],
    queryFn: async () => {
      // Get all user's flashcards
      const { data: decks } = await supabase
        .from("flashcard_decks")
        .select("id")
        .eq("user_id", user!.id);
      
      if (!decks?.length) return 0;
      
      const deckIds = decks.map(d => d.id);
      
      const { data: cards } = await supabase
        .from("flashcards")
        .select("id")
        .in("deck_id", deckIds);
      
      if (!cards?.length) return 0;
      
      const { data: progress } = await supabase
        .from("flashcard_progress")
        .select("flashcard_id, next_review")
        .eq("user_id", user!.id)
        .in("flashcard_id", cards.map(c => c.id));
      
      const progressMap = new Map(progress?.map(p => [p.flashcard_id, p]) || []);
      const now = new Date();
      
      // Count due cards (no progress = new = due, or next_review <= now)
      return cards.filter(card => {
        const p = progressMap.get(card.id);
        if (!p) return true; // New card
        return new Date(p.next_review) <= now;
      }).length;
    },
    enabled: !!user,
  });
};

// Create a new deck
export const useCreateDeck = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { 
      title: string; 
      description?: string; 
      course_id?: string;
      lesson_id?: string;
    }) => {
      const { data: deck, error } = await supabase
        .from("flashcard_decks")
        .insert({
          ...data,
          user_id: user!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return deck;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });
};

// Delete a deck
export const useDeleteDeck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deckId: string) => {
      const { error } = await supabase
        .from("flashcard_decks")
        .delete()
        .eq("id", deckId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });
};

// Add a card to a deck
export const useAddCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { deck_id: string; front: string; back: string }) => {
      const { data: card, error } = await supabase
        .from("flashcards")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return card;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-deck", variables.deck_id] });
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });
};

// Update a card
export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: string; front?: string; back?: string }) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from("flashcards")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-deck"] });
    },
  });
};

// Delete a card
export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cardId: string) => {
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", cardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-deck"] });
      queryClient.invalidateQueries({ queryKey: ["flashcard-decks"] });
    },
  });
};

// Rate a card and update progress
export const useRateCard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      cardId, 
      rating, 
      currentProgress 
    }: { 
      cardId: string; 
      rating: 1 | 2 | 3 | 4;
      currentProgress: FlashcardProgressRecord | null;
    }) => {
      const quality = uiRatingToSM2Quality(rating);
      
      const progress: FlashcardProgress = currentProgress ? {
        ease_factor: Number(currentProgress.ease_factor),
        interval_days: currentProgress.interval_days,
        repetitions: currentProgress.repetitions,
        next_review: currentProgress.next_review,
        last_review: currentProgress.last_review,
      } : {
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
        next_review: new Date().toISOString(),
        last_review: null,
      };
      
      const result = calculateNextReview(quality, progress);
      
      const { error } = await supabase
        .from("flashcard_progress")
        .upsert({
          user_id: user!.id,
          flashcard_id: cardId,
          ease_factor: result.ease_factor,
          interval_days: result.interval_days,
          repetitions: result.repetitions,
          next_review: result.next_review.toISOString(),
          last_review: new Date().toISOString(),
        }, {
          onConflict: "user_id,flashcard_id",
        });
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-deck"] });
      queryClient.invalidateQueries({ queryKey: ["due-cards-count"] });
    },
  });
};
