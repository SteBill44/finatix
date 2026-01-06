import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays, addDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

export interface StudyPlan {
  id: string;
  user_id: string;
  course_id: string;
  exam_date: string;
  target_study_hours_per_week: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  courses?: { title: string; slug: string } | null;
}

export interface StudyGoal {
  id: string;
  plan_id: string;
  date: string;
  target_minutes: number;
  actual_minutes: number;
  lessons_target: string[];
  lessons_completed: string[];
  completed: boolean;
}

// Get all study plans for the current user
export const useStudyPlans = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["study-plans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_plans")
        .select(`*, courses (title, slug)`)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as StudyPlan[];
    },
    enabled: !!user,
  });
};

// Get active study plan for a course
export const useActiveStudyPlan = (courseId: string | undefined) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["active-study-plan", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_plans")
        .select(`*, courses (title, slug)`)
        .eq("user_id", user!.id)
        .eq("course_id", courseId!)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data as StudyPlan | null;
    },
    enabled: !!courseId && !!user,
  });
};

// Get study goals for a plan
export const useStudyGoals = (planId: string | undefined) => {
  return useQuery({
    queryKey: ["study-goals", planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_goals")
        .select("*")
        .eq("plan_id", planId!)
        .order("date");
      
      if (error) throw error;
      return data as StudyGoal[];
    },
    enabled: !!planId,
  });
};

// Get today's goal
export const useTodayGoal = (planId: string | undefined) => {
  const today = format(new Date(), "yyyy-MM-dd");
  
  return useQuery({
    queryKey: ["today-goal", planId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_goals")
        .select("*")
        .eq("plan_id", planId!)
        .eq("date", today)
        .maybeSingle();
      
      if (error) throw error;
      return data as StudyGoal | null;
    },
    enabled: !!planId,
  });
};

// Get this week's goals
export const useWeekGoals = (planId: string | undefined) => {
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  
  return useQuery({
    queryKey: ["week-goals", planId, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_goals")
        .select("*")
        .eq("plan_id", planId!)
        .gte("date", weekStart)
        .lte("date", weekEnd)
        .order("date");
      
      if (error) throw error;
      return data as StudyGoal[];
    },
    enabled: !!planId,
  });
};

// Create a new study plan
export const useCreateStudyPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      course_id: string;
      exam_date: string;
      target_study_hours_per_week: number;
    }) => {
      // Deactivate existing plans for this course
      await supabase
        .from("study_plans")
        .update({ is_active: false })
        .eq("user_id", user!.id)
        .eq("course_id", data.course_id);
      
      // Create new plan
      const { data: plan, error } = await supabase
        .from("study_plans")
        .insert({
          ...data,
          user_id: user!.id,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Generate goals for each day until exam
      const examDate = new Date(data.exam_date);
      const today = new Date();
      const daysUntilExam = differenceInDays(examDate, today);
      
      if (daysUntilExam > 0) {
        const minutesPerDay = Math.round((data.target_study_hours_per_week * 60) / 7);
        const goals = [];
        
        for (let i = 0; i <= Math.min(daysUntilExam, 90); i++) { // Max 90 days of goals
          const date = addDays(today, i);
          goals.push({
            plan_id: plan.id,
            date: format(date, "yyyy-MM-dd"),
            target_minutes: minutesPerDay,
          });
        }
        
        await supabase.from("study_goals").insert(goals);
      }
      
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      queryClient.invalidateQueries({ queryKey: ["active-study-plan"] });
    },
  });
};

// Update study plan
export const useUpdateStudyPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      id: string; 
      exam_date?: string; 
      target_study_hours_per_week?: number;
      is_active?: boolean;
    }) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from("study_plans")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      queryClient.invalidateQueries({ queryKey: ["active-study-plan"] });
    },
  });
};

// Delete study plan
export const useDeleteStudyPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from("study_plans")
        .delete()
        .eq("id", planId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-plans"] });
      queryClient.invalidateQueries({ queryKey: ["active-study-plan"] });
    },
  });
};

// Update goal progress
export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      goalId: string;
      actual_minutes?: number;
      lessons_completed?: string[];
      completed?: boolean;
    }) => {
      const { goalId, ...updates } = data;
      const { error } = await supabase
        .from("study_goals")
        .update(updates)
        .eq("id", goalId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-goals"] });
      queryClient.invalidateQueries({ queryKey: ["today-goal"] });
      queryClient.invalidateQueries({ queryKey: ["week-goals"] });
    },
  });
};

// Helper to calculate days until exam
export function getDaysUntilExam(examDate: string): number {
  return differenceInDays(new Date(examDate), new Date());
}

// Helper to get week days
export function getWeekDays(): Date[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}
