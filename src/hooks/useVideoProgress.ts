import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useRef } from "react";

interface VideoProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
  updated_at: string;
}

export function useVideoProgress(lessonId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const lastSavedRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch video progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ["video-progress", lessonId, user?.id],
    queryFn: async () => {
      if (!user || !lessonId) return null;

      const { data, error } = await supabase
        .from("video_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching video progress:", error);
        throw error;
      }

      return data as VideoProgress | null;
    },
    enabled: !!user && !!lessonId,
    staleTime: 1000 * 60 * 5,
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async ({
      progressSeconds,
      durationSeconds,
      completed,
    }: {
      progressSeconds: number;
      durationSeconds: number;
      completed?: boolean;
    }) => {
      if (!user || !lessonId) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("video_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("video_progress")
          .update({
            progress_seconds: progressSeconds,
            duration_seconds: durationSeconds,
            completed: completed || false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("video_progress").insert({
          user_id: user.id,
          lesson_id: lessonId,
          progress_seconds: progressSeconds,
          duration_seconds: durationSeconds,
          completed: completed || false,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["video-progress", lessonId, user?.id],
      });
    },
  });

  // Debounced save function - saves every 5 seconds if position changed
  const saveProgress = useCallback(
    (progressSeconds: number, durationSeconds: number) => {
      // Only save if position changed by more than 3 seconds
      if (Math.abs(progressSeconds - lastSavedRef.current) < 3) return;

      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule save
      saveTimeoutRef.current = setTimeout(() => {
        lastSavedRef.current = progressSeconds;
        saveProgressMutation.mutate({
          progressSeconds,
          durationSeconds,
          completed: durationSeconds > 0 && progressSeconds >= durationSeconds * 0.9,
        });
      }, 2000);
    },
    [saveProgressMutation]
  );

  // Immediate save (for when leaving page)
  const saveProgressImmediate = useCallback(
    (progressSeconds: number, durationSeconds: number) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      lastSavedRef.current = progressSeconds;
      saveProgressMutation.mutate({
        progressSeconds,
        durationSeconds,
        completed: durationSeconds > 0 && progressSeconds >= durationSeconds * 0.9,
      });
    },
    [saveProgressMutation]
  );

  return {
    progress,
    isLoading,
    saveProgress,
    saveProgressImmediate,
    isSaving: saveProgressMutation.isPending,
  };
}
