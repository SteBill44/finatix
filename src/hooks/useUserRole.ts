import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "user" | "master_admin";

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return data?.map((r) => r.role as AppRole) || [];
    },
    enabled: !!user,
  });
};

export const useIsAdmin = () => {
  const { data: roles, isLoading } = useUserRole();
  return {
    isAdmin: roles?.includes("admin") || roles?.includes("master_admin") || false,
    isLoading,
  };
};

export const useIsMasterAdmin = () => {
  const { data: roles, isLoading } = useUserRole();
  return {
    isMasterAdmin: roles?.includes("master_admin") ?? false,
    isLoading,
  };
};
