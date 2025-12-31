import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  enrollment_confirmation: boolean;
  progress_reminders: boolean;
  course_completion: boolean;
  new_content: boolean;
  discussion_replies: boolean;
  weekly_digest: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotificationPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notification_preferences", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      
      if (error && error.code === "PGRST116") {
        // No preferences found, create default
        const { data: newPrefs, error: insertError } = await supabase
          .from("notification_preferences")
          .insert({ user_id: user!.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newPrefs as NotificationPreferences;
      }
      
      if (error) throw error;
      return data as NotificationPreferences;
    },
    enabled: !!user,
  });
};

export const useUpdateNotificationPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .update(preferences)
        .eq("user_id", user!.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_preferences"] });
    },
  });
};
