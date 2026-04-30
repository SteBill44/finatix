import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LessonProgress {
  id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  lessons?: {
    id: string;
    course_id: string;
    title: string;
  } | null;
}

export interface LastLesson {
  lesson_id: string;
  lesson_title: string;
  course_id: string;
  course_slug: string;
  course_title: string;
}

export const useLessons = (courseId?: string) => {
  return useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      let query = supabase
        .from("lessons")
        .select("*")
        .order("order_index", { ascending: true });

      if (courseId) query = query.eq("course_id", courseId);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useLessonProgress = (courseId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lesson_progress", user?.id, courseId],
    queryFn: async (): Promise<LessonProgress[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("lesson_progress")
        .select(`
          id,
          lesson_id,
          completed,
          completed_at,
          lessons (
            id,
            course_id,
            title
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      if (courseId) {
        return (data as LessonProgress[]).filter((p) => p.lessons?.course_id === courseId);
      }
      return data as LessonProgress[];
    },
    enabled: !!user,
  });
};

export const useLastAccessedLesson = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["last_accessed_lesson", user?.id],
    queryFn: async (): Promise<LastLesson | null> => {
      if (!user) return null;

      const { data: progressData, error: progressError } = await supabase
        .from("lesson_progress")
        .select(`
          lesson_id,
          completed_at,
          lessons (
            id,
            title,
            course_id,
            order_index
          )
        `)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1);

      if (progressError) throw progressError;

      if (progressData && progressData.length > 0) {
        const last = progressData[0] as { lesson_id: string; lessons: { id: string; title: string; course_id: string; order_index: number } | null };
        const courseId = last.lessons?.course_id;

        if (courseId) {
          const [courseResult, allLessonsResult, completedResult] = await Promise.all([
            supabase.from("courses").select("id, title, slug").eq("id", courseId).single(),
            supabase.from("lessons").select("id, title, order_index").eq("course_id", courseId).order("order_index", { ascending: true }),
            supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("completed", true),
          ]);

          const courseData = courseResult.data;
          const allLessons = allLessonsResult.data;
          const completedIds = new Set(completedResult.data?.map((p) => p.lesson_id) ?? []);
          const nextLesson = allLessons?.find((l) => !completedIds.has(l.id));

          if (courseData) {
            const target = nextLesson ?? allLessons?.[allLessons.length - 1];
            if (target) {
              return {
                lesson_id: target.id,
                lesson_title: target.title,
                course_id: courseData.id,
                course_slug: courseData.slug,
                course_title: courseData.title,
              };
            }
          }
        }
      }

      // Fallback: first lesson of most recently enrolled course
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id, courses (id, title, slug)")
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false })
        .limit(1);

      if (enrollments && enrollments.length > 0) {
        const enrollment = enrollments[0] as { course_id: string; courses: { id: string; title: string; slug: string } | null };
        const { data: firstLesson } = await supabase
          .from("lessons")
          .select("id, title")
          .eq("course_id", enrollment.course_id)
          .order("order_index", { ascending: true })
          .limit(1)
          .single();

        if (firstLesson && enrollment.courses) {
          return {
            lesson_id: firstLesson.id,
            lesson_title: firstLesson.title,
            course_id: enrollment.courses.id,
            course_slug: enrollment.courses.slug,
            course_title: enrollment.courses.title,
          };
        }
      }

      return null;
    },
    enabled: !!user,
  });
};

export const useCourseProgress = (courseId: string) => {
  const { data: lessons } = useLessons(courseId);
  const { data: progress } = useLessonProgress(courseId);

  const totalLessons = lessons?.length ?? 0;
  const completedLessons = progress?.filter((p) => p.completed).length ?? 0;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return { totalLessons, completedLessons, percentage };
};

export const useMarkLessonComplete = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, courseId }: { lessonId: string; courseId: string }) => {
      if (!user) throw new Error("Must be logged in");

      // Check if this is the user's first completed lesson (for referral completion)
      const { data: existingProgress } = await supabase
        .from("lesson_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .limit(1);

      const isFirstLesson = !existingProgress || existingProgress.length === 0;

      const { data, error } = await supabase
        .from("lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (isFirstLesson) {
        // Referral completion is optional — failure is non-fatal
        await supabase.rpc("complete_referral", { p_referred_id: user.id }).catch(() => {});
      }

      // Check if all lessons in the course are now complete
      const [allLessonsResult, completedLessonsResult] = await Promise.all([
        supabase.from("lessons").select("id").eq("course_id", courseId),
        supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("completed", true),
      ]);

      const allIds = allLessonsResult.data?.map((l) => l.id) ?? [];
      const doneIds = new Set(completedLessonsResult.data?.map((p) => p.lesson_id) ?? []);
      const allDone = allIds.length > 0 && allIds.every((id) => doneIds.has(id));

      if (allDone) {
        await supabase
          .from("enrollments")
          .update({ completed_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .is("completed_at", null);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_progress", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["referral-stats"] });
    },
  });
};
