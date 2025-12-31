import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges?: Badge;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  updated_at: string;
}

export const useBadges = () => {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("category")
        .order("requirement_value");
      
      if (error) throw error;
      return data as Badge[];
    },
  });
};

export const useUserBadges = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["user_badges", targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          badges (*)
        `)
        .eq("user_id", targetUserId!)
        .order("earned_at", { ascending: false });
      
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!targetUserId,
  });
};

export const useUserStreak = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_streak", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data as UserStreak | null;
    },
    enabled: !!user,
  });
};

export const useUpdateStreak = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      // Get current streak
      const { data: existingStreak } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (!existingStreak) {
        // Create new streak
        const { error } = await supabase.from("user_streaks").insert({
          user_id: user!.id,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
        });
        if (error) throw error;
        return { newStreak: 1 };
      }

      const lastDate = existingStreak.last_activity_date;
      if (lastDate === today) {
        // Already logged today
        return { newStreak: existingStreak.current_streak };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;
      if (lastDate === yesterdayStr) {
        newStreak = existingStreak.current_streak + 1;
      }

      const longestStreak = Math.max(newStreak, existingStreak.longest_streak);

      const { error } = await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
        })
        .eq("user_id", user!.id);

      if (error) throw error;
      return { newStreak, longestStreak };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_streak"] });
    },
  });
};

export const useLeaderboard = (limit = 10) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_streaks")
        .select(`
          *,
          profiles:user_id (
            full_name,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order("current_streak", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAwardBadge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeId: string) => {
      const { data, error } = await supabase
        .from("user_badges")
        .insert({
          user_id: user!.id,
          badge_id: badgeId,
        })
        .select()
        .single();

      if (error && error.code !== "23505") throw error; // Ignore duplicate
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_badges"] });
    },
  });
};
