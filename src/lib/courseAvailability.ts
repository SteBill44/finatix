import type { CourseContentStatus } from "@/hooks/useCourseContentStatus";

/** A course has usable practice once it has enough marked questions to be worth a session. */
export const PRACTICE_MIN_QUESTIONS = 20;

export function practiceAvailable(s?: CourseContentStatus | null): boolean {
  return Boolean(s && s.questions >= PRACTICE_MIN_QUESTIONS);
}

export type AvailabilityTone = "live" | "partial" | "dev" | "unknown";

/** One honest label per course, shared by the homepage and anywhere else that lists courses. */
export function availabilityLabel(s?: CourseContentStatus | null): { label: string; tone: AvailabilityTone } {
  if (!s) return { label: "Status unavailable", tone: "unknown" };
  if (s.is_free) {
    return practiceAvailable(s)
      ? { label: "Free · practice available", tone: "live" }
      : { label: "Free · outline only", tone: "partial" };
  }
  if (s.on_sale) return { label: "Available", tone: "live" };
  if (s.is_case_study) return { label: "In development · case policy pending", tone: "dev" };
  return { label: "In development", tone: "dev" };
}

export const HOME_CTAS = {
  startPractising: "/courses/ba1-business-economics#curriculum",
  explore: "#platform",
  newToCima: "/start/new",
  paper: "/start/paper",
  caseStudy: "/start/case-study",
  courses: "/courses",
  pricing: "/pricing",
  whyCima: "/why-cima",
} as const;
