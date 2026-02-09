/**
 * Centralized Query Definitions
 * All data fetching logic in one place for consistency and reusability
 */

import { tracked, from, rpc, ApiResult } from "./client";

// Types
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

// ============= COURSES =============

export async function getCourses(): Promise<ApiResult<Tables["courses"]["Row"][]>> {
  return tracked("courses:list", () =>
    from("courses")
      .select("*")
      .order("created_at", { ascending: false })
  );
}

export async function getCourseBySlug(slug: string): Promise<ApiResult<Tables["courses"]["Row"]>> {
  return tracked("courses:getBySlug", () =>
    from("courses")
      .select("*")
      .eq("slug", slug)
      .single()
  );
}

export async function getCourseById(id: string): Promise<ApiResult<Tables["courses"]["Row"]>> {
  return tracked("courses:getById", () =>
    from("courses")
      .select("*")
      .eq("id", id)
      .single()
  );
}

// ============= LESSONS =============

export async function getLessonsByCourse(courseId: string): Promise<ApiResult<Tables["lessons"]["Row"][]>> {
  return tracked("lessons:byCourse", () =>
    from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true })
  );
}

export async function getLessonById(lessonId: string): Promise<ApiResult<Tables["lessons"]["Row"]>> {
  return tracked("lessons:getById", () =>
    from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single()
  );
}

// ============= ENROLLMENTS =============

export async function getUserEnrollments(userId: string): Promise<ApiResult<(Tables["enrollments"]["Row"] & { courses: Tables["courses"]["Row"] | null })[]>> {
  return tracked("enrollments:byUser", () =>
    from("enrollments")
      .select("*, courses(*)")
      .eq("user_id", userId)
  );
}

export async function getEnrollment(userId: string, courseId: string): Promise<ApiResult<Tables["enrollments"]["Row"]>> {
  return tracked("enrollments:get", () =>
    from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()
  );
}

export async function createEnrollment(
  userId: string,
  courseId: string
): Promise<ApiResult<Tables["enrollments"]["Row"]>> {
  return tracked("enrollments:create", () =>
    from("enrollments")
      .insert({ user_id: userId, course_id: courseId })
      .select()
      .single()
  );
}

// ============= PROGRESS =============

export async function getLessonProgress(userId: string, courseId: string): Promise<ApiResult<Tables["lesson_progress"]["Row"][]>> {
  return tracked("progress:lessons", () =>
    from("lesson_progress")
      .select("*, lessons!inner(course_id)")
      .eq("user_id", userId)
      .eq("lessons.course_id", courseId)
  );
}

export async function markLessonComplete(
  userId: string,
  lessonId: string
): Promise<ApiResult<Tables["lesson_progress"]["Row"]>> {
  return tracked("progress:complete", () =>
    from("lesson_progress")
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()
  );
}

// ============= PROFILES =============

export async function getProfile(userId: string): Promise<ApiResult<Tables["profiles"]["Row"]>> {
  return tracked("profiles:get", () =>
    from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single()
  );
}

export async function updateProfile(
  userId: string,
  updates: Partial<Tables["profiles"]["Update"]>
): Promise<ApiResult<Tables["profiles"]["Row"]>> {
  return tracked("profiles:update", () =>
    from("profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single()
  );
}

// ============= QUIZZES =============

export async function getQuizzesByCourse(courseId: string): Promise<ApiResult<Tables["quizzes"]["Row"][]>> {
  return tracked("quizzes:byCourse", () =>
    from("quizzes")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true })
  );
}

export async function getQuizById(quizId: string): Promise<ApiResult<Tables["quizzes"]["Row"]>> {
  return tracked("quizzes:getById", () =>
    from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single()
  );
}

export async function getQuizAttempts(
  userId: string,
  quizId?: string
): Promise<ApiResult<Tables["quiz_attempts"]["Row"][]>> {
  let query = from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false });

  if (quizId) {
    query = query.eq("quiz_id", quizId);
  }

  return tracked("quizzes:attempts", () => query);
}

// ============= ADMIN STATS =============

export async function getAdminDashboardStats() {
  return rpc("get_admin_dashboard_stats");
}

export async function getPlatformAnalytics() {
  return rpc("get_platform_analytics");
}

// ============= DISCUSSIONS =============

export async function getDiscussionPosts(
  courseId: string,
  lessonId?: string | null
): Promise<ApiResult<Tables["discussion_posts"]["Row"][]>> {
  let query = from("discussion_posts")
    .select("*")
    .eq("course_id", courseId)
    .is("parent_id", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (lessonId) {
    query = query.eq("lesson_id", lessonId);
  }

  return tracked("discussions:list", () => query);
}

export async function createDiscussionPost(
  data: Tables["discussion_posts"]["Insert"]
): Promise<ApiResult<Tables["discussion_posts"]["Row"]>> {
  return tracked("discussions:create", () =>
    from("discussion_posts")
      .insert(data)
      .select()
      .single()
  );
}

// ============= CERTIFICATES =============

export async function getUserCertificates(userId: string): Promise<ApiResult<(Tables["certificates"]["Row"] & { courses: Tables["courses"]["Row"] | null })[]>> {
  return tracked("certificates:byUser", () =>
    from("certificates")
      .select("*, courses(*)")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false })
  );
}

export async function verifyCertificate(certificateNumber: string): Promise<ApiResult<Tables["certificates"]["Row"]>> {
  return tracked("certificates:verify", () =>
    from("certificates")
      .select("*, courses(*)")
      .eq("certificate_number", certificateNumber)
      .single()
  );
}

// ============= GAMIFICATION =============

export async function getUserStreak(userId: string): Promise<ApiResult<Tables["user_streaks"]["Row"]>> {
  return tracked("gamification:streak", () =>
    from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single()
  );
}

export async function getUserBadges(userId: string): Promise<ApiResult<(Tables["user_badges"]["Row"] & { badges: Tables["badges"]["Row"] | null })[]>> {
  return tracked("gamification:badges", () =>
    from("user_badges")
      .select("*, badges(*)")
      .eq("user_id", userId)
  );
}

// Query config getters for useQuery
export const queryKeys = {
  courses: {
    all: ["courses"] as const,
    detail: (slug: string) => ["courses", slug] as const,
    byId: (id: string) => ["courses", "id", id] as const,
  },
  lessons: {
    byCourse: (courseId: string) => ["lessons", courseId] as const,
    detail: (lessonId: string) => ["lessons", "detail", lessonId] as const,
  },
  enrollments: {
    byUser: (userId: string) => ["enrollments", userId] as const,
    detail: (userId: string, courseId: string) => ["enrollments", userId, courseId] as const,
  },
  progress: {
    lessons: (userId: string, courseId: string) => ["progress", "lessons", userId, courseId] as const,
    video: (userId: string, lessonId: string) => ["progress", "video", userId, lessonId] as const,
  },
  profiles: {
    byUser: (userId: string) => ["profiles", userId] as const,
  },
  quizzes: {
    byCourse: (courseId: string) => ["quizzes", courseId] as const,
    attempts: (userId: string, quizId?: string) => ["quizzes", "attempts", userId, quizId] as const,
  },
  discussions: {
    byCourse: (courseId: string, lessonId?: string | null) => ["discussions", courseId, lessonId] as const,
  },
  certificates: {
    byUser: (userId: string) => ["certificates", userId] as const,
  },
  gamification: {
    streak: (userId: string) => ["gamification", "streak", userId] as const,
    badges: (userId: string) => ["gamification", "badges", userId] as const,
  },
  admin: {
    stats: ["admin", "stats"] as const,
    analytics: ["admin", "analytics"] as const,
  },
};
