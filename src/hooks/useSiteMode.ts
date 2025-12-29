import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteMode = "coming_soon" | "live";

export const useSiteMode = () => {
  return useQuery({
    queryKey: ["site-mode"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "site_mode")
        .single();

      if (error) throw error;
      return data?.value as SiteMode;
    },
    staleTime: 1000 * 60, // Cache for 1 minute
  });
};

export const useUpdateSiteMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMode: SiteMode) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("site_settings")
        .update({ 
          value: newMode,
          updated_at: new Date().toISOString(),
          updated_by: user?.id 
        })
        .eq("key", "site_mode");

      if (error) throw error;
      return newMode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-mode"] });
    },
  });
};
