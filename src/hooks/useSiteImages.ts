import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSiteImages = (keys: string[]) => {
  return useQuery({
    queryKey: ["site-images", keys],
    queryFn: async () => {
      if (keys.length === 0) return {};
      const { data, error } = await supabase
        .from("site_images")
        .select("key, image_url")
        .in("key", keys);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((row) => {
        map[row.key] = row.image_url;
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSiteImage = (key: string, fallback: string) => {
  const { data } = useSiteImages([key]);
  return data?.[key] || fallback;
};

export const useUpsertSiteImage = () => {
  const queryClient = useQueryClient();

  const upsertSiteImage = async (key: string, imageUrl: string) => {
    const { error } = await supabase
      .from("site_images")
      .upsert({ key, image_url: imageUrl, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["site-images"] });
  };

  return { upsertSiteImage };
};
