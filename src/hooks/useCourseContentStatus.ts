import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Live content counts per course, straight from the database.
 * - lesson_records: lesson rows (may be titles only)
 * - substantive_lessons: lessons with at least 1,500 characters of text. This is
 *   a size check only - it is NOT editorial approval.
 * - videos / downloads exclude placeholder (example.com) links.
 * - usable_mocks: mock exams with at least 20 attached questions.
 * - on_sale: explicit editorial approval AND all content prerequisites met.
 */
export interface CourseContentStatus {
  course_id: string;
  is_free: boolean;
  lesson_records: number;
  substantive_lessons: number;
  videos: number;
  questions: number;
  downloads: number;
  placeholder_downloads: number;
  mock_exams: number;
  usable_mocks: number;
  editorially_approved: boolean;
  prerequisites_met: boolean;
  on_sale: boolean;
}

/** Paid courses can be bought only when on_sale. Free courses are always enrollable. */
export function canPurchase(s?: CourseContentStatus | null) {
  return Boolean(s && !s.is_free && s.on_sale);
}

/** True when the course has little or no real teaching material yet. */
export function isInDevelopment(s?: CourseContentStatus | null) {
  if (!s) return false;
  if (!s.is_free) return !s.on_sale;
  return s.substantive_lessons + s.videos < s.lesson_records;
}

export function useCourseContentStatus() {
  return useQuery({
    queryKey: ["course-content-status"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_course_content_status");
      if (error) throw error;
      const map = new Map<string, CourseContentStatus>();
      ((data ?? []) as CourseContentStatus[]).forEach((r) => map.set(r.course_id, r));
      return map;
    },
  });
}
