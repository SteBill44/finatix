# Homepage evaluation and redesign plan (finatix.io)

## 1. What is usable today (checked against live data and code, 1 Oct 2026)

| Course | Lessons | Real written lessons / videos | Questions (with explanations) | Topic-tagged | Mocks usable | Downloads |
|---|---|---|---|---|---|---|
| BA1 | 18 | 0 written (longest text is 177 characters) / 1 video | 189 (189): 180 in 18 lesson quizzes + 9 in a practice set | 0 | 0 of 5 | 3, all placeholders |
| BA2 | 18 | 0 / 0 | 188 (188) | 0 | 0 of 5 | 2, all placeholders |
| BA3 | 18 | 0 / 0 | 5 | 0 | 0 | placeholders |
| BA4 | 16 | 0 / 0 | 0 | 0 | 0 | placeholders |
| All 12 paid courses (e.g. E1, OCS) | outlines only | 0 / 0 | 0 | 0 | 0 | none or placeholders |

**What this means**
- Lessons are **outlines only**. That's true even for BA1 and BA2.
- The one real learning experience is **BA1 and BA2 lesson quizzes** (about 10 questions per lesson, each with an explanation). You reach them via course page → lesson → quiz (`/quiz/:quizId`).
- **Practice Mode (`/practice/:courseSlug`) currently has no questions for any course.**
  - `get_adaptive_practice_questions` and the fallback in `src/hooks/useAdaptivePractice.ts` (lines 37–85) only use questions marked `is_practice_pool = true`.
  - Live count of such questions: **0**.
  - So a "Practise" button pointed there would land on the "No questions" state (`src/pages/PracticeMode.tsx`, line 322).
- **Topic feedback doesn't work yet.** Every question has `syllabus_area_index = null`, so these show nothing meaningful today:
  - mastery by syllabus area (`useSyllabusMastery.ts`, `SyllabusMasteryCard.tsx`)
  - "weak spot" adaptive selection
  - the competency radar
- **The readiness score exists** but needs at least 10 attempts, and has no topic data behind it.
- **No mock exams can be taken**: every mock record has 0 questions.
- The study plan, flashcards and dashboard screens exist, but their value depends on the content gaps above.

## 2. Homepage claims that conflict with this

- `Features.tsx` claims:
  - "Practice that follows your weak spots" (no topic tags or practice pool)
  - timed mocks "with a breakdown of where you lost marks" (no usable mocks)
  - "competency across each syllabus area" (no topic tags)
- `CTA.tsx`: "Competency radar & readiness score" and "Track progress across all CIMA levels" (only BA1/BA2 have practice).
- `Hero.tsx`, the third "loop" card: "track weaker syllabus areas". The "Learn the topic" card is fine because it says outlines.
- `LearningPathway.tsx`: "Practice exams and feedback" and "Earn your first certificate". Certificates need a final exam, and BA final exams have 0 questions.
- `HowToBegin.tsx`: "Begin building your foundation" is fine. "Work through lesson outlines and exam-style practice" is accurate only for BA1/BA2, not BA3/BA4.
- `Index.tsx`: the `InstructorProfiles` intro says "Every tutor listed here teaches on the platform". It's harmless only while the list is empty, so remove it.
- `Index.tsx` FAQ schema promises "lifetime access" and corporate purchase "for instant access", which is misleading while paid courses are closed.
- The hero's GDP example quiz (`TryQuestion.tsx`) is the calculation-style content you don't like.

## 3. Your proposed direction, assessed

Agreed overall: a product-led preview replaces the quiz, nothing personal is faked, the identity stays the same and there's less repetition. Changes so it stays honest:
- **Review tab:** show the real **per-question explanation** feedback and the quiz score. Don't show "topic feedback" until questions are tagged by topic.
- **Primary CTA "Start practising free":** send it to the BA1 course page anchored at the lesson list (`/courses/ba1-business-economics#curriculum`), where the lesson quizzes are. Not `/practice/...`, which is empty today.
- **Secondary CTA "Explore the platform":** scrolls to `#platform` on the homepage.
- **Headline:** I'd change "Your next CIMA exam. A clearer way forward." to "Your next CIMA exam, with a clearer way forward." It reads better as one sentence and has the same meaning. You can override this.

## 4. Final section order

```text
1. Hero              headline, copy, 2 CTAs, static product preview
2. #platform         3 manual tabs: Explore / Practise / Review (keyboard tabs)
3. Start here        one consolidated chooser: New to CIMA / Studying a paper / Case study
                     (replaces JourneyPicker + LearningPathway + HowToBegin)
4. Course availability   one compact table of the 4 levels and 16 courses with a live status
                     (Available free / Practice available / Outline only / In development)
5. Plans             OfferSummary, unchanged prices, "not open yet" shown where it applies
6. Independence + FAQ   QualificationDisclosure + trimmed FAQ (remove the misleading answers)
7. Final CTA         one line + "Start practising free"
```

Moved off the homepage: `WhatIsCIMA` and `CareerPathways` go to `/why-cima`, which already exists. `Features` is removed, because the platform tabs replace it. `TestimonialsSection` and `InstructorProfiles` stay hidden until verified data exists.

## 5. Copy (realistic)

- Hero: "Your next CIMA exam, with a clearer way forward."
- Supporting copy: "Practise BA1 and BA2 free: about 190 exam-style questions per paper, organised by lesson, each with a worked explanation. Other courses show their outline while they're being written."
- Tabs:
  - Explore: "See every lesson in the CIMA syllabus order before you sign up."
  - Practise: "Short lesson quizzes, marked the moment you finish."
  - Review: "Every answer explained, so a wrong answer still teaches you something."
- Below the tabs, in small text: "Lesson notes, mock exams and topic-by-topic feedback are being built and aren't available yet."

## 6. Preview interactions

- The preview is a static, styled mock of real screens, built from real data:
  - the BA1 lesson list from `get_course_curriculum`
  - one question layout with its explanation
- It contains **no calculation or equation**. Use a short wording-based BA1 question with a non-numeric answer.
- Tabs switch manually (no auto-rotation). They follow the ARIA tabs pattern, respect `prefers-reduced-motion`, and don't depend on hover.
- Remove the brown and orange blur blobs from the hero. Use one subtle orange accent on charcoal, and break up the repeated card grids with the table and tabs.

## 7. Availability handling

- Read statuses from the existing `useCourseContentStatus`. Add a derived `practice_available` flag for courses with 20 or more questions, which today means BA1 and BA2 only.
- Labels:
  - BA1/BA2 → "Free · practice available"
  - BA3/BA4 → "Free · outline only"
  - Paid courses → "In development"
  - Case studies → "In development · case policy pending"
- Prerendered HTML must show the same labels. If live status fails to load, show a neutral "Status unavailable" rather than a guess.

## 8. Measurement (consent-aware, no answers or emails)

Funnel events (extending `src/lib/analytics.ts` `trackEvent`):

```text
hero_cta_click {cta}           -> course_curriculum_view {course}
-> sign_up_started / sign_up   -> lesson_open {course}
-> quiz_start {course}         -> quiz_complete {course, question_count}   <- "first real completed session"
```

The key metric is the percentage of people who click "Start practising free" and then complete at least one quiz within 7 days. Also track drop-off at the sign-up step. The current baseline (55 visitors in 30 days) is too small to compare until there are about 300 visitors after launch.

## 9. Acceptance criteria

- No equations or calculations anywhere on the homepage. The hero has no quiz.
- Every CTA resolves to an existing route: `/courses/ba1-business-economics#curriculum`, `#platform`, `/start/*`, `/courses`, `/pricing`, `/why-cima`.
- No homepage claim about weak-spot adaptation, topic mastery, a radar, mocks, certificates being earnable, or tutors, until the underlying data exists.
- The availability labels match `get_course_content_status` for all 16 courses.
- Desktop at 1440 and 1024 px looks polished; 375 px works. Keyboard users can operate the tabs, focus is visible, and the page passes an axe check with no serious issues.
- The prerender still produces the homepage with real visible text and the canonical `https://finatix.io`.
- Existing purchase blocks, prices and entitlements are unchanged. Nothing is published.

## 10. Recommended content fixes (separate from the redesign, needed for the stronger claims later)

1. Mark the BA1/BA2 practice questions `is_practice_pool = true` so Practice Mode works. Or change Practice Mode to fall back to lesson-quiz questions.
2. Tag questions with syllabus areas so topic feedback and adaptive practice become real.
3. Write BA1/BA2 lesson notes, and build at least one mock per paper.

These are data and content decisions. I'll ask before doing them; the homepage plan doesn't depend on them.

## Technical details

- New: `src/components/home/HeroPreview.tsx`, `PlatformTabs.tsx`, `StartChooser.tsx` (reusing `/start` routes and `learningContext`), `CourseAvailability.tsx`.
- Edit: `Hero.tsx` (remove `TryQuestion`), `Index.tsx` (new order, trimmed FAQ schema), `WhyCIMA.tsx` (receives the `WhatIsCIMA` and `CareerPathways` sections), `useCourseContentStatus.ts` (`practiceAvailable`), `CourseDetail.tsx` (add `id="curriculum"` if it's missing), `analytics.ts` (new events), and `Lesson.tsx`/`Quiz.tsx` (fire `lesson_open`, `quiz_start` and `quiz_complete`).
- Keep `TryQuestion.tsx` in the codebase but unused, so it can be reused on BA1 course pages if wanted.
- Checks: vitest for the availability labels and CTA destinations, plus Playwright screenshots at 1440, 1024 and 375 px, then the build with `PRERENDER_CHROMIUM_PATH` set.
