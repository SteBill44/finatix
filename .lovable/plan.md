

## Change Continue Learning button to open last course dashboard

On the student dashboard, the "Continue Learning" button currently jumps straight into the last lesson the student was working on. You want it to instead land them on the **course dashboard** of the most recently visited course, so they can choose their next move (lesson, practice, mock exam, etc.) rather than being dropped directly into a lesson.

### What changes

- The "Continue Learning" button in the dashboard header will navigate to the course detail page of the last-accessed course (e.g. `/courses/financial-accounting`) instead of a specific lesson URL.
- All other behaviour (button visibility, label, icon, empty state when no enrollments exist) stays the same.

### Technical detail

- File: `src/pages/Dashboard.tsx`
- The `useLastAccessedLesson()` hook already returns `course_slug` alongside `lesson_id` and `course_id`, so no hook changes are needed.
- Replace the navigation target on the Continue Learning button:
  - From: `navigate(\`/courses/${lastLesson.course_id}/lesson/${lastLesson.lesson_id}\`)`
  - To: `navigate(\`/courses/${lastLesson.course_slug}\`)`

This matches the same route pattern used by `CourseProgressRow` when clicking a course row, keeping navigation consistent across the dashboard.

