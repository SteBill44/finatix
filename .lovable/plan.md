

# Content & Anti-Cheat Strategy Plan

## Current State

- **16 courses** across 4 levels (Certificate, Operational, Management, Strategic)
- **~222 chapters** total across all courses
- BA1 and BA2 already have lesson quizzes (18 each, ~10 questions per quiz) and ~189 questions each
- BA1 already has 5 mock exam quiz entries (but with 0 questions in them)
- Most other courses have 5 course-level quiz entries (mock exam placeholders) but 0 questions
- **0 practice pool questions** across all courses
- No `quiz_type` column exists on the `quizzes` table to distinguish lesson quizzes, mocks, and final exams
- Anti-cheat: FocusMonitor component exists (tab-switch detection), used in MockExam page but NOT in ExamMode (final exam) page

## What Needs to Happen

### 1. Database Schema Changes

Add a `quiz_type` column to the `quizzes` table to classify quizzes:
- `lesson_quiz` — per-chapter quiz
- `mock_exam` — one of 5 mock exams per course
- `final_exam` — the course final exam
- `practice` — practice pool container

Backfill existing data:
- Quizzes with `lesson_id IS NOT NULL` → `lesson_quiz`
- Quizzes titled "Mock Exam" → `mock_exam`
- Remaining course-level quizzes (like "Practice Quiz") → `lesson_quiz` or reclassify

### 2. AI-Generated Question Content (Edge Function)

Create an edge function `generate-course-questions` that uses Lovable AI (Gemini 2.5 Pro) to generate questions for a given course. This function will:

- Accept a `course_id`, `quiz_type` (lesson_quiz, mock_exam, final_exam, practice), and optional `lesson_id`
- Pull course title, lesson titles, and syllabus areas from the database for context
- Generate CIMA-appropriate multiple choice questions with explanations
- Insert them directly into `quiz_questions` linked to the appropriate quiz
- For **practice pool**: mark `is_practice_pool = true`, spread across syllabus areas and difficulty levels

Admin triggers this from the admin panel per course.

### 3. Content Generation Targets

| Type | Per Course | Questions Each | Total Questions |
|------|-----------|----------------|-----------------|
| Lesson Quizzes | 1 per chapter (~14 avg) | 10 | ~140 per course |
| Mock Exams | 5 | 45 (CIMA standard) | 225 per course |
| Final Exam | 1 | 60 | 60 per course |
| Practice Bank | 1 pool | 500 | 500 per course |

### 4. Final Exam Anti-Cheat Enhancements

The `ExamMode.tsx` page (used for final exams) currently lacks anti-cheat. Add:

- **FocusMonitor** — already built, just needs to be wired into ExamMode (currently only in MockExam)
- **Copy/paste prevention** — disable text selection and right-click during exam
- **Question randomization** — shuffle question order per attempt (server-side in `get_quiz_questions`)
- **Answer option randomization** — shuffle option order per question
- **Time enforcement** — already exists via ExamTimer, ensure auto-submit on time expiry
- **Single attempt tracking** — record focus violations count in `quiz_attempts` table
- **Fullscreen prompt** — request fullscreen mode on exam start
- **Server-side scoring** — already handled via `submit-quiz` edge function

### 5. Admin Panel Updates

Add a "Generate Questions" action to `CourseManagement.tsx` that lets admins:
- Select a course
- Choose what to generate (lesson quizzes, mock exams, final exam, practice bank)
- Trigger the AI generation edge function
- See progress/status

### 6. Code Changes Summary

**Database migration:**
- Add `quiz_type` column to `quizzes` (default: `'lesson_quiz'`)
- Add `focus_violations` column to `quiz_attempts`
- Backfill existing quiz types
- Create final exam quiz entries for each course

**Edge function:** `generate-course-questions/index.ts`
- AI-powered question generation using Gemini 2.5 Pro
- Batch insert questions into database

**Frontend changes:**
- `ExamMode.tsx` — Add FocusMonitor, fullscreen request, copy/paste prevention, record violations
- `CourseManagement.tsx` — Add question generation UI
- `useQuizzes.ts` — Filter by quiz_type where needed
- Course detail page — Separate sections for lesson quizzes, mock exams, final exam, practice

### 7. Implementation Order

1. Database migration (add `quiz_type`, `focus_violations`, backfill data)
2. Create `generate-course-questions` edge function
3. Add admin UI for triggering generation
4. Wire anti-cheat features into ExamMode
5. Update course detail/navigation to distinguish quiz types

