import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCourseContentStatus } from "@/hooks/useCourseContentStatus";

export type LevelStatus = { label: string; live: boolean };

/** One honest status per CIMA level, computed from live course data. */
export function useLevelAvailability() {
  const { data: status } = useCourseContentStatus();
  const { data: courses } = useQuery({
    queryKey: ["home-course-list"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, slug, level").order("title");
      if (error) throw error;
      return data;
    },
  });

  const forLevel = (level: string): LevelStatus | null => {
    if (!courses || !status) return null;
    const rows = courses.filter((c) => c.level === level).map((c) => status.get(c.id)).filter(Boolean);
    if (!rows.length) return null;
    if (rows.some((r) => r!.is_free)) return { label: "Free to start", live: true };
    if (rows.some((r) => r!.on_sale)) return { label: "Available", live: true };
    return { label: "In development", live: false };
  };

  return { forLevel };
}
