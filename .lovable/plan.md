## Problem

On `/courses/e1-managing-finance`, the lessons list is empty even though 15 lessons exist in the database.

## Root cause (confirmed from network logs)

`src/hooks/useCourseDetailOptimized.ts` calls an RPC named `get_course_detail_with_progress`, which returns **404 PGRST202** — the function does not exist in the database:

```
Could not find the function public.get_course_detail_with_progress(p_course_id, p_user_id) in the schema cache
```

Because that call throws, `courseDetail` is `undefined` in `CourseDetail.tsx`, so `lessons`, `lessonProgress`, and `quizzes` all fall back to `[]` and the Lessons section renders nothing. (A parallel direct `lessons` fetch does succeed and returns all 15 rows — visible in the network log — but the page doesn't read from it.)

## Fix

Replace the missing RPC in `src/hooks/useCourseDetailOptimized.ts` with parallel direct table queries that return the same shape the consumers already expect:

- `lessons` — `from("lessons").select("*").eq("course_id", …).order("order_index")`
- `progress` — `from("lesson_progress").select("*").eq("user_id", …)` filtered to this course's lesson IDs (or `null` when signed out)
- `quizzes` — `from("quizzes").select("*").eq("course_id", …)`
- `course` — single-row fetch by id (kept for shape parity)

Run them with `Promise.all` and assemble the `CourseDetailResponse` object. No consumer changes needed — `CourseDetail.tsx` already destructures `lessons`, `progress`, `quizzes` from the response.

## Out of scope

Not creating the SQL RPC — the client-side direct queries are equivalent and unblock the page immediately without a migration. If you'd prefer the DB-side function for perf, I can add that as a follow-up.
