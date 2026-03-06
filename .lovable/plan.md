

# Fix: Mock Exams → 60 Questions (not 45)

Two places need updating:

1. **Edge function** (`supabase/functions/generate-course-questions/index.ts`, line ~101): Change `questionCount = 45` to `questionCount = 60` and update the prompt text accordingly.

2. **Admin UI** (`src/components/admin/QuestionGenerator.tsx`, line ~119): Update the label from `"Mock Exams (5 × 45 questions)"` to `"Mock Exams (5 × 60 questions)"`.

