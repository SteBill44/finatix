import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalUsers: number;
  totalEnrollments: number;
  totalCourses: number;
  totalLessons: number;
  totalQuizzes: number;
  totalCompletions: number;
  totalCertificates: number;
  totalReviews: number;
  activeStudentsToday: number;
  newUsersThisWeek: number;
  enrollmentsTrend: Array<{ date: string; count: number }>;
  topCourses: Array<{
    id: string;
    title: string;
    level: string;
    enrollments: number;
    rating: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_name: string;
    created_at: string;
    admin_user_id: string;
  }>;
}

export function useAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_dashboard_stats");
      
      if (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }
      
      return data as unknown as DashboardStats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
