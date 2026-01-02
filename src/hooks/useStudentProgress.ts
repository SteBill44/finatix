import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  courses: {
    id: string;
    title: string;
    slug: string;
    level: string;
    duration_hours: number;
  };
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface QuizAttempt {
  id: string;
  course_id: string;
  score: number;
  max_score: number;
  attempted_at: string;
}

export interface StudySession {
  id: string;
  course_id: string | null;
  duration_minutes: number;
  started_at: string;
  ended_at: string | null;
}

export const useEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          enrolled_at,
          completed_at,
          courses (
            id,
            title,
            slug,
            level,
            duration_hours
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data as Enrollment[];
    },
    enabled: !!user,
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useLessons = (courseId?: string) => {
  return useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      let query = supabase
        .from("lessons")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (courseId) {
        query = query.eq("course_id", courseId);
      }
      
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
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
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

      const { data, error } = await query;
      if (error) throw error;
      
      if (courseId) {
        return data.filter((p: any) => p.lessons?.course_id === courseId);
      }
      return data;
    },
    enabled: !!user,
  });
};

export interface LastLesson {
  lesson_id: string;
  lesson_title: string;
  course_id: string;
  course_slug: string;
  course_title: string;
}

export const useLastAccessedLesson = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["last_accessed_lesson", user?.id],
    queryFn: async (): Promise<LastLesson | null> => {
      if (!user) return null;
      
      // Get the most recent lesson progress entry
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

      // If we have progress, find the next uncompleted lesson or return the last one
      if (progressData && progressData.length > 0) {
        const lastProgress = progressData[0] as any;
        const courseId = lastProgress.lessons?.course_id;
        
        if (courseId) {
          // Get course info
          const { data: courseData } = await supabase
            .from("courses")
            .select("id, title, slug")
            .eq("id", courseId)
            .single();

          // Get all lessons for this course
          const { data: allLessons } = await supabase
            .from("lessons")
            .select("id, title, order_index")
            .eq("course_id", courseId)
            .order("order_index", { ascending: true });

          // Get completed lesson IDs
          const { data: completedProgress } = await supabase
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("completed", true);

          const completedIds = new Set(completedProgress?.map(p => p.lesson_id) || []);

          // Find the first uncompleted lesson
          const nextLesson = allLessons?.find(l => !completedIds.has(l.id));

          if (nextLesson && courseData) {
            return {
              lesson_id: nextLesson.id,
              lesson_title: nextLesson.title,
              course_id: courseData.id,
              course_slug: courseData.slug,
              course_title: courseData.title,
            };
          }

          // If all completed, return the last lesson
          if (allLessons && allLessons.length > 0 && courseData) {
            const lastLesson = allLessons[allLessons.length - 1];
            return {
              lesson_id: lastLesson.id,
              lesson_title: lastLesson.title,
              course_id: courseData.id,
              course_slug: courseData.slug,
              course_title: courseData.title,
            };
          }
        }
      }

      // Fallback: get the first lesson of the first enrolled course
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
          course_id,
          courses (
            id,
            title,
            slug
          )
        `)
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false })
        .limit(1);

      if (enrollments && enrollments.length > 0) {
        const enrollment = enrollments[0] as any;
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
  
  const totalLessons = lessons?.length || 0;
  const completedLessons = progress?.filter((p) => p.completed).length || 0;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  
  return { totalLessons, completedLessons, percentage };
};

export const useQuizAttempts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["quiz_attempts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!user,
  });
};

export const useStudySessions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["study_sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as StudySession[];
    },
    enabled: !!user,
  });
};

export const useTotalStudyTime = () => {
  const { data: sessions } = useStudySessions();
  
  const totalMinutes = sessions?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return { totalMinutes, hours, minutes, formatted: `${hours}h ${minutes}m` };
};

export const useEnrollInCourse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};

export const useEnrollInMultipleCourses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseIds: string[]) => {
      if (!user) throw new Error("Must be logged in");
      
      // Get existing enrollments to avoid duplicates
      const { data: existingEnrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id);
      
      const existingCourseIds = new Set(existingEnrollments?.map(e => e.course_id) || []);
      const newCourseIds = courseIds.filter(id => !existingCourseIds.has(id));
      
      if (newCourseIds.length === 0) {
        return { enrolled: 0, message: "Already enrolled in all courses" };
      }
      
      const enrollments = newCourseIds.map(courseId => ({
        user_id: user.id,
        course_id: courseId,
      }));
      
      const { data, error } = await supabase
        .from("enrollments")
        .insert(enrollments)
        .select();

      if (error) throw error;
      return { enrolled: data.length, message: `Enrolled in ${data.length} courses` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};

export const useMarkLessonComplete = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, courseId }: { lessonId: string; courseId: string }) => {
      if (!user) throw new Error("Must be logged in");
      
      // Mark the lesson as complete
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

      // Check if all lessons in the course are now complete
      const { data: allLessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", courseId);

      const { data: completedLessons } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .in("lesson_id", allLessons?.map(l => l.id) || []);

      // If all lessons are complete, mark the enrollment as completed
      if (allLessons && completedLessons && allLessons.length > 0 && 
          completedLessons.length >= allLessons.length) {
        await supabase
          .from("enrollments")
          .update({ completed_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .is("completed_at", null); // Only update if not already completed
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_progress"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};

export const useRecordQuizAttempt = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, score, maxScore }: { courseId: string; score: number; maxScore: number }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: user.id,
          course_id: courseId,
          score,
          max_score: maxScore,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz_attempts"] });
    },
  });
};

export const useStartStudySession = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId?: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user.id,
          course_id: courseId || null,
          duration_minutes: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study_sessions"] });
    },
  });
};

export const useEndStudySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, durationMinutes }: { sessionId: string; durationMinutes: number }) => {
      const { data, error } = await supabase
        .from("study_sessions")
        .update({
          duration_minutes: durationMinutes,
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study_sessions"] });
    },
  });
};
