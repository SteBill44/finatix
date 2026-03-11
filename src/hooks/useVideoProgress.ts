import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { from, tracked } from "@/lib/api/client";
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
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: progress, isLoading } = useQuery({
    queryKey: ["video-progress", lessonId, user?.id],
    queryFn: async () => {
      if (!user || !lessonId) return null;
      const result = await tracked("video:getProgress", () =>
        from("video_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .maybeSingle()
      );
      if (result.error) throw result.error;
      return result.data as VideoProgress | null;
    },
    enabled: !!user && !!lessonId,
    staleTime: 1000 * 60 * 5,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async ({
      progressSeconds, durationSeconds, completed,
    }: {
      progressSeconds: number; durationSeconds: number; completed?: boolean;
    }) => {
      if (!user || !lessonId) throw new Error("Not authenticated");

      const { data: existing } = await from("video_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existing) {
        const { error } = await from("video_progress")
          .update({
            progress_seconds: progressSeconds,
            duration_seconds: durationSeconds,
            completed: completed || false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await from("video_progress").insert({
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
      queryClient.invalidateQueries({ queryKey: ["video-progress", lessonId, user?.id] });
    },
  });

  const saveProgress = useCallback(
    (progressSeconds: number, durationSeconds: number) => {
      if (Math.abs(progressSeconds - lastSavedRef.current) < 3) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        lastSavedRef.current = progressSeconds;
        saveProgressMutation.mutate({
          progressSeconds, durationSeconds,
          completed: durationSeconds > 0 && progressSeconds >= durationSeconds * 0.9,
        });
      }, 2000);
    },
    [saveProgressMutation]
  );

  const saveProgressImmediate = useCallback(
    (progressSeconds: number, durationSeconds: number) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      lastSavedRef.current = progressSeconds;
      saveProgressMutation.mutate({
        progressSeconds, durationSeconds,
        completed: durationSeconds > 0 && progressSeconds >= durationSeconds * 0.9,
      });
    },
    [saveProgressMutation]
  );

  return { progress, isLoading, saveProgress, saveProgressImmediate, isSaving: saveProgressMutation.isPending };
}
