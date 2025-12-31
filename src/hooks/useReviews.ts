import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    first_name: string | null;
    avatar_url: string | null;
  };
}

export const useCourseReviews = (courseId: string) => {
  return useQuery({
    queryKey: ["course_reviews", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CourseReview[];
    },
    enabled: !!courseId,
  });
};

export const useCourseRating = (courseId: string) => {
  return useQuery({
    queryKey: ["course_rating", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("rating")
        .eq("course_id", courseId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { averageRating: 0, totalReviews: 0 };
      }
      
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      return {
        averageRating: sum / data.length,
        totalReviews: data.length,
      };
    },
    enabled: !!courseId,
  });
};

export const useUserReview = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_review", courseId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user!.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data as CourseReview | null;
    },
    enabled: !!user && !!courseId,
  });
};

export const useSubmitReview = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      rating,
      title,
      content,
    }: {
      courseId: string;
      rating: number;
      title?: string;
      content?: string;
    }) => {
      // Check if review exists
      const { data: existing } = await supabase
        .from("course_reviews")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", user!.id)
        .single();

      // Check if user is enrolled
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", user!.id)
        .single();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from("course_reviews")
          .update({
            rating,
            title: title || null,
            content: content || null,
            is_verified_purchase: !!enrollment,
          })
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("course_reviews")
          .insert({
            course_id: courseId,
            user_id: user!.id,
            rating,
            title: title || null,
            content: content || null,
            is_verified_purchase: !!enrollment,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["course_reviews", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["course_rating", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["user_review", variables.courseId] });
    },
  });
};
