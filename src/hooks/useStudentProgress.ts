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

export const useMarkLessonComplete = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user) throw new Error("Must be logged in");
      
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson_progress"] });
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
