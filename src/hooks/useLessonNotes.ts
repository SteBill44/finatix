import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useRef } from "react";

interface LessonNote {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  updated_at: string;
  created_at: string;
}

export function useLessonNotes(lessonId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch lesson notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ["lesson-notes", lessonId, user?.id],
    queryFn: async () => {
      if (!user || !lessonId) return null;

      const { data, error } = await supabase
        .from("lesson_notes")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching lesson notes:", error);
        throw error;
      }

      return data as LessonNote | null;
    },
    enabled: !!user && !!lessonId,
    staleTime: 1000 * 60 * 5,
  });

  // Save notes mutation
  const saveNotesMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !lessonId) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("lesson_notes")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("lesson_notes")
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("lesson_notes").insert({
          user_id: user.id,
          lesson_id: lessonId,
          content,
        });

        if (error) throw error;
      }
      
      return content;
    },
    onSuccess: (content) => {
      // Update cache directly instead of invalidating to avoid refetch loops
      queryClient.setQueryData(["lesson-notes", lessonId, user?.id], (old: LessonNote | null) => {
        if (old) {
          return { ...old, content, updated_at: new Date().toISOString() };
        }
        return {
          id: "temp",
          user_id: user?.id || "",
          lesson_id: lessonId || "",
          content,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
      });
    },
  });

  // Debounced save function
  const saveNotes = useCallback(
    (content: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveNotesMutation.mutate(content);
      }, 1000);
    },
    [saveNotesMutation]
  );

  // Immediate save
  const saveNotesImmediate = useCallback(
    (content: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveNotesMutation.mutate(content);
    },
    [saveNotesMutation]
  );

  return {
    notes,
    isLoading,
    saveNotes,
    saveNotesImmediate,
    isSaving: saveNotesMutation.isPending,
  };
}
