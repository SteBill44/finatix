

## Add Current Course stats to the student dashboard

Show a focused snapshot of the course the student is actively working on, sitting between the welcome header and the existing 3-stat strip. It uses the same data the course dashboard already calculates, so numbers stay consistent.

### What the user will see

A single "Current Course" card at the top of `/dashboard` (only shown when the student has a recently accessed course):

- **Course title** + level badge (Certificate / Operational / Management / Strategic)
- **"Up next" line** — the next uncompleted lesson title (e.g. "Up next: Lesson 4 — Cost classification")
- **Progress bar** with `X / Y lessons · NN%`
- **Three small stat tiles** in one row:
  - Exam Readiness (`%` + label: Getting Started / Building / Developing / Exam Ready)
  - Quiz Average (`%` for that course, or "—")
  - Mock Exam Average (`%` for that course, or "—")
- **Two CTAs** on the right: "Continue Learning" (jumps to next lesson) and "Open Course" (course dashboard)

If the student has no recently accessed course, the section is hidden and the dashboard renders exactly as today.

### Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Current Course                                               │
│ ───────────────────────────────────────────────────────────  │
│ F1 Financial Reporting              [Operational]            │
│ Up next: Lesson 7 — Statement of cash flows                  │
│ ▓▓▓▓▓▓▓▓░░░░  12/24 lessons · 50%      [Continue][Open]      │
│                                                              │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ Readiness    │ │ Quiz Avg     │ │ Mock Avg     │          │
│ │   62%        │ │   71%        │ │   —          │          │
│ │ Developing   │ │ 142 Qs       │ │ 0 attempts   │          │
│ └──────────────┘ └──────────────┘ └──────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

The existing global "Enrolled / Completed / Quiz Avg" strip stays beneath it (those summarise the whole account; this new card is per-course).

### Technical detail

- **File created:** `src/components/dashboard/CurrentCourseCard.tsx`
  - Props: `courseId`, `courseTitle`, `courseSlug`, `courseLevel`, `nextLessonId`, `nextLessonTitle`.
  - Hooks used (all already exist):
    - `useLessons(courseId)` and `useLessonProgress(courseId)` → `completedLessons / totalLessons / percentage`.
    - `useReadinessScore(courseId)` from `src/hooks/useReadinessScore.ts` → overall readiness + label.
    - `useQuizAttempts()` filtered by `course_id === courseId` → quiz average + question count.
    - For mock-exam average: filter the same attempts to those whose `quiz_id` belongs to a `quizzes` row with `quiz_type = 'mock_exam' | 'final_exam'` (use `useQuizzes(courseId)` from `src/hooks/useQuizzes.ts`).
  - Uses the same `getScoreColor` / readiness-label thresholds as `EnrolledCourseDashboard.tsx` so values match the course view 1:1.
  - Continue button → `/courses/${courseSlug}/lesson/${nextLessonId}` (falls back to course page if no next lesson).
  - Open Course button → `/courses/${courseSlug}`.
  - Level badge colours pulled from the same `LEVEL_GROUPS` map already in `Dashboard.tsx` (extracted into the new component or imported).

- **File edited:** `src/pages/Dashboard.tsx`
  - Render `<CurrentCourseCard … />` directly under the welcome header, only when `lastLesson` from `useLastAccessedLesson()` is truthy and `enrolledCount > 0`.
  - Pass `lastLesson.course_id`, `course_title`, `course_slug`, `lesson_id`, `lesson_title`. To get the level, look the matching enrollment up by `course_id` in the existing `enrollments` query (no new request).
  - The existing header "Continue Learning" button is removed (the card now owns that CTA), keeping the header simpler. The "Browse Courses" button for users with zero enrollments stays.

- No DB or RLS changes — every required field is already accessible via existing hooks and policies.

### Edge cases handled

- No enrollments → card hidden, "Browse Courses" empty state unchanged.
- Enrolled but never opened a lesson → `useLastAccessedLesson` falls back to the most recently enrolled course's first lesson, so the card still appears with `0 / N lessons`, readiness `0%`, quiz/mock `—`.
- All lessons completed → "Up next" replaced with "Course complete — review or revisit lessons", Continue button becomes "Review Course".
- Loading → card renders a thin skeleton matching its height to avoid layout shift.

