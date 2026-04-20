import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "urgent";
  target_audience: "all" | "enrolled" | "admins" | "course_specific";
  course_id: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export const useAnnouncements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["announcements_active"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await (supabase as any)
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .or(`target_audience.eq.all,target_audience.eq.enrolled`)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("created_at", { ascending: false });

      if (error) return [] as Announcement[];
      return (data || []) as Announcement[];
    },
    enabled: !!user,
    staleTime: 60000,
  });
};
