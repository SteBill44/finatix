import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { from, tracked } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CIMAProfileData {
  cima_id: string | null;
  first_name: string | null;
  last_name: string | null;
  cima_start_date: string | null;
  cima_end_date: string | null;
}

export interface CIMAProfileUpdate {
  cima_id?: string;
  first_name?: string;
  last_name?: string;
  cima_start_date?: string;
  cima_end_date?: string;
}

export const useCIMAProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["cima-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const result = await tracked("cima:getProfile", () =>
        from("profiles")
          .select("cima_id, first_name, last_name, cima_start_date, cima_end_date")
          .eq("user_id", user.id)
          .maybeSingle()
      );
      if (result.error) throw result.error;
      return result.data as CIMAProfileData | null;
    },
    enabled: !!user,
  });
};

export const useHasCIMAProfile = () => {
  const { data: profile, isLoading } = useCIMAProfile();
  const hasCompleteProfile = !!(profile?.cima_id && profile?.first_name && profile?.last_name);
  return { hasCompleteProfile, isLoading, profile };
};

export const useUpdateCIMAProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CIMAProfileUpdate) => {
      if (!user) throw new Error("Not authenticated");

      const { data: existingProfile } = await from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await from("profiles")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await from("profiles").insert({ user_id: user.id, ...data });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cima-profile", user?.id] });
    },
  });
};
