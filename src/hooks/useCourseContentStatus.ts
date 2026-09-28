import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CourseContentStatus {
  course_id: string;
  lessons: number;
  lessons_with_content: number;
  videos: number;
  questions: number;
  resources: number;
}

/** A course is "ready" only when real teaching material exists behind its lessons. */
export function isCourseContentReady(s?: CourseContentStatus | null) {
  if (!s || s.lessons === 0) return false;
  const taught = s.lessons_with_content + s.videos;
  return taught / s.lessons >= 0.5 && s.questions >= 20;
}

/** Counts come straight from the live course data - never hand-written figures. */
export function useCourseContentStatus() {
  return useQuery({
    queryKey: ["course-content-status"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("get_course_content_status");
      if (error) throw error;
      const map = new Map<string, CourseContentStatus>();
      (data as CourseContentStatus[]).forEach((r) => map.set(r.course_id, r));
      return map;
    },
  });
}
