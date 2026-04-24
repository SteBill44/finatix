# Site-Wide Refactoring Plan

> **Goal:** Improve structure, readability, and maintainability across the codebase **without changing UI or functionality.**
> **Approach:** Incremental, low-risk slices. Every slice is independently shippable, testable, and reversible.
> **Scope:** 151 components, 33 pages, 8 edge functions, ~30 hooks (~48k LoC, excluding generated types).

---

## 1. Guiding Principles

1. **Behaviour preservation first.** No visual or functional change in any slice. Snapshot/visual diff or manual smoke-test before merge.
2. **One concern per slice.** Each PR touches one file family or one cross-cutting concern.
3. **Tests before refactor.** For any non-trivial extraction, add a characterization test first, then refactor, then re-run.
4. **Stop at the seam.** When a file shrinks below ~250 LoC and reads top-to-bottom, the slice is done — resist gold-plating.
5. **Use what already exists.** `src/lib/api/client.ts`, `src/lib/api/queries.ts`, `useUIStore`, `errorHandling.ts`, design tokens — extend before inventing.

---

## 2. Prioritisation Method

Files were ranked by combining three signals:

| Signal | Source |
|---|---|
| **Size** (LoC) | `wc -l` over `src/**` and `supabase/functions/**` |
| **Reach** (import count) | `grep` of `import ... from "@/..."` |
| **Hook density** (state complexity proxy) | `useState/useEffect/useCallback/useMemo` count |

A file scores **High** priority if it is in the top decile of size **and** is either imported widely or owns user-critical flows (auth, quiz submission, payments, lesson playback).

---

## 3. Findings — Ranked Refactor Targets

### Tier 1 — High impact, high reach (do first)

| # | File | LoC | Why it matters | Smell |
|---|------|----:|---|---|
| 1 | `src/components/course/EnrolledCourseDashboard.tsx` | 1002 | Main learner surface after login | God-component: progress + readiness + recommendations + mastery + history all inline |
| 2 | `src/pages/ManageAccount.tsx` | 792 | Account, profile, security, deletion in one file | Mixes 5 inline `supabase.*` calls with form state and tabs |
| 3 | `src/components/admin/CourseManagement.tsx` | 768 | Admin authoring entry point | 18 hooks, 6 inline supabase calls, dialogs + table + forms in one component |
| 4 | `src/pages/MockExam.tsx` | 716 | Exam integrity-critical flow | 16 hooks, timer + answers + focus monitor + submit logic interleaved |
| 5 | `src/pages/CourseDetail.tsx` | 704 | Public-facing conversion page | Mixes marketing sections with enrollment logic |
| 6 | `src/components/quiz/QuestionRenderer.tsx` | 628 | Renders 7+ question types | Single switch component — each type deserves its own renderer file |
| 7 | `src/pages/ExamMode.tsx` | 593 | Twin of MockExam — duplication risk | 17 hooks; large overlap with MockExam (timer, focus, submit) |
| 8 | `src/pages/Lesson.tsx` | 588 | Core content delivery | Video + notes + resources + nav + completion in one file |

### Tier 2 — Sizeable admin/auxiliary surfaces

| # | File | LoC | Notes |
|---|------|----:|---|
| 9 | `src/components/admin/ResourceManagement.tsx` | 719 | 4× `any`, 5 inline supabase calls |
| 10 | `src/pages/Pricing.tsx` | 602 | Static-ish marketing — extract bundle/individual cards |
| 11 | `src/components/quiz/FormulaSheet.tsx` | 624 | Pure data — move tables to `src/data/formulas/` |
| 12 | `src/pages/Brand.tsx` | 741 | Style guide page — split per token category |
| 13 | `src/components/admin/UserDetailSheet.tsx` | 534 | Multi-tab sheet — extract per-tab subcomponents |
| 14 | `src/components/quiz/ExamCalculator.tsx` | 503 | Logic engine — extract pure functions to `lib/calculator/` |
| 15 | `src/hooks/useStudentProgress.ts` | 590 | 3× `any`, single giant async fn — split selectors |
| 16 | `src/components/layout/Navbar.tsx` | 384 | Imported via `Layout` on 30+ routes — split desktop/mobile menus |

### Tier 3 — Cross-cutting cleanups

| Concern | Where | Why |
|---|---|---|
| **Direct `supabase.from` outside data layer** | 12 files in `pages/` and `components/admin/` | We already have `lib/api/client.ts` + `queries.ts` — funnel calls through it for tracking + error normalisation |
| **`as any` / `: any`** | `useSubmitQuiz.test.ts` (10), `LearningPathsManagement.tsx` (7) | Replace with generated `Database` types |
| **Edge function duplication** | `submit-quiz` (287), `validate-practice-answer` (163), `generate-course-questions` (297) | Extract shared helpers (auth check, rate limit, error envelope) into `supabase/functions/_shared/` |
| **Test coverage gaps** | Only 5 test files for 48k LoC | Add characterization tests for Tier 1 files before refactoring |

---

## 4. Phased Execution Plan

Each phase is a separate slice. Ship, smoke-test, then move to the next.

### Phase 0 — Safety net (no production code changes)
- **0.1** Add Vitest characterization tests for: `useStudentProgress`, `useReadinessScore` (extend), `QuestionRenderer` per question-type.
- **0.2** Add a Playwright smoke spec: login → dashboard → open lesson → submit a 3-question quiz → view certificate.
- **Risk:** none. **Gate:** all green in CI before Phase 1.

### Phase 1 — Decompose Tier 1 god-components (one file per slice)
For each Tier 1 file, the recipe is:
1. **Extract pure helpers** to `lib/<domain>/` (e.g. exam scoring, mastery math).
2. **Extract presentational subcomponents** into a sibling folder.
3. **Lift data fetching** into a hook in `src/hooks/` that returns a typed view-model.
4. **Container shrinks** to composition + layout. Target ≤ 250 LoC.

| Slice | Target | Expected outcome |
|---|---|---|
| 1.1 | `EnrolledCourseDashboard.tsx` | 1002 → ~200 + 5 subcomponents |
| 1.2 | `ManageAccount.tsx` | 792 → ~180 + tab components + `useAccountActions` |
| 1.3 | `MockExam.tsx` + `ExamMode.tsx` | Share `useExamSession` hook; collapse duplicated timer/focus/submit |
| 1.4 | `QuestionRenderer.tsx` | Switch → registry of `renderers/<type>.tsx` |
| 1.5 | `Lesson.tsx` | Split into `LessonHeader`, `LessonBody`, `LessonSidebar` |
| 1.6 | `CourseDetail.tsx` | Split marketing sections; lift enrollment into `useEnrollCourse` |
| 1.7 | `CourseManagement.tsx` | Split `CourseTable`, `CourseFormDialog`, `CourseDeleteDialog` |

### Phase 2 — Funnel data access through the API layer
- **2.1** Replace inline `supabase.from(...)` in the 12 leaking files with hooks/queries from `src/lib/api/queries.ts` (extend it where missing).
- **2.2** Wrap each call with `tracked(...)` so performance + error logging is uniform.
- **2.3** Remove `as any` casts using `Tables<'name'>` / `TablesInsert<'name'>` helpers.
- **Risk:** low — wire-compatible refactor; covered by characterization tests.

### Phase 3 — Tier 2 cleanups
- Apply the Phase 1 recipe to Tier 2 files (smaller scope each).
- Move pure data (formula tables, brand tokens) out of `.tsx` into `src/data/` modules.

### Phase 4 — Edge function consolidation
- **4.1** Create `supabase/functions/_shared/auth.ts` (JWT extract + user lookup), `rate-limit.ts`, `response.ts` (uniform JSON error envelope).
- **4.2** Refactor `submit-quiz`, `validate-practice-answer`, `generate-course-questions` to use them.
- **4.3** Add `deno test` smoke for the shared helpers.
- **Risk:** medium — backend behaviour-sensitive. Mitigation: deploy one function at a time, watch logs.

### Phase 5 — Type tightening
- Eliminate remaining `any` (≤20 instances). Generated DB types + Zod schemas (already used in `lib/validation.ts`) cover most.

---

## 5. Per-Slice Definition of Done

A slice is mergeable only when:
- [ ] No visual diff vs main on the affected route (manual or screenshot diff).
- [ ] Existing + new unit tests pass (`vitest`).
- [ ] Playwright smoke spec passes.
- [ ] `tsc --noEmit` clean; ESLint clean.
- [ ] Bundle size delta ≤ +1% (check `dist/` after `vite build`).
- [ ] Slice description lists *what behaviour is preserved* and *how it was verified*.

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Regression in exam/quiz scoring | Phase 0 characterization tests freeze current scoring; refactor must keep them green |
| Auth/account edge cases (delete, password) | Manual checklist on staging; never ship `ManageAccount` refactor without it |
| Hidden coupling between Tier 1 components | Each slice is small enough to revert in one commit |
| Edge-function downtime | Roll out one function per deploy; keep previous version logs for 24h |
| Scope creep into UI tweaks | PR template requires "no UI change" tickbox; reviewer rejects mixed PRs |

---

## 7. Estimated Effort

| Phase | Slices | Rough effort |
|---|---:|---|
| 0 — Safety net | 2 | 0.5 day |
| 1 — Tier 1 decomposition | 7 | 3–4 days |
| 2 — Data-access funnelling | 12 files | 1.5 days |
| 3 — Tier 2 cleanups | 8 | 2 days |
| 4 — Edge functions | 3 | 1 day |
| 5 — Type tightening | sweep | 0.5 day |
| **Total** | | **~8–9 days** focused, parallelisable |

---

## 8. Out of Scope (explicit)

- No design-system or token changes.
- No new features, new pages, or new dependencies (other than dev-only test utilities if needed).
- No database schema changes.
- No changes to generated files (`src/integrations/supabase/types.ts`, `client.ts`).

---

## 9. Open Questions for Reviewer

1. **Tier 1 ordering** — start with the most-visited learner surface (`EnrolledCourseDashboard`) or the riskiest pair (`MockExam` / `ExamMode` consolidation)?
2. **Subcomponent layout** — sibling folder (`EnrolledCourseDashboard/index.tsx` + parts) or flat with prefix (`EnrolledCourseDashboard.Progress.tsx`)?
3. **Edge-function shared module** — OK to add `_shared/auth.ts` and `_shared/rate-limit.ts`, or keep current per-function copies for isolation?
4. **Test budget** — acceptable to add ~15–20 new test files in Phase 0 before any refactor commits?

> Please review and flag preferences on §9 before I begin Phase 0. **No code will change until you sign off.**
