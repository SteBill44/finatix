# Finatix audit and implementation plan

This audit comes from reading the code, routes and live course data. No payments were made and no personal data was read.

## Headline finding (P0): the paid courses are almost empty

The live data shows:

| Level | Lessons | Lessons with written content | Videos | Quiz questions |
|---|---|---|---|---|
| Certificate (BA1–BA4, free) | 70 | 0 (the longest is 177 characters) | 1 (BA1) | BA1 189, BA2 188, BA3 5, BA4 0 |
| Operational E1/P1/F1 + OCS | 51 | 0 | 0 | 0 |
| Management E2/P2/F2 + MCS | 48 | 0 | 0 | 0 |
| Strategic E3/P3/F3 + SCS | 47 | 0 | 0 | 0 |

There are 33 downloadable resources in total and 0 reviews.

Twelve paid courses are on sale at £199 each, plus £499 level bundles and a £999 complete bundle. Every one of them has lesson titles only: no lesson text, no videos and no questions. The mock exams, practice mode and readiness scores in these courses therefore have nothing to work with. This is the biggest trust, legal and refund risk on the site. It matters more than any design or conversion work.

## What is real, what is a demo, what is blank

Real and working:
- Course catalogue, lesson outlines and public curriculum preview
- Guest-first checkout through Stripe, with prices set on the server
- Webhook that records each payment once, fulfils it in a single transaction and handles refunds and disputes
- Access checks that separate paid access from free enrolment and keep test payments apart from live ones
- Server-side quiz marking for all question types, with tests
- Certificates issued by the backend, and a public verification page
- Journey pages (/start), paper landing pages, cookie-aware analytics and Search Console setup

Demo or made-up numbers still in the code:
- `DashboardRedesigned.tsx` line 192 shows a random progress figure, and line 184 has a "Simplified for demo" filter. If this page can be reached, learners see fake progress.
- `CurrentCourseCard.tsx` works out mock-exam averages. Figures are real, but show 0 or blank for every paid course.
- Readiness and mastery cards look authoritative even when there are no attempts behind them.

Evidence-gated, so hidden correctly:
- Testimonials, instructor profiles and pass-rate data are all empty lists. Their sections stay hidden, and that is correct.
- `claims.ts` states that Finatix is independent of CIMA and cites a dated source for each figure. Accurate.

## Prioritised issues

### P0
1. **Paid products without content** (see the table above). You need to decide whether to pause sales. See Blockers.
2. **Readiness, mastery and mock results show on empty courses.** They present blank data as though it were a result.
3. **Random progress** in `DashboardRedesigned.tsx`.
4. **Email domain mismatch.** `src/lib/company.ts` and the Terms, Privacy and Cookie pages use `@finatix.com`, but the site runs on finatix.io. If those mailboxes don't exist, legal and support emails go nowhere.

### P1
5. BA3 has 5 questions and BA4 has none. These are the free courses that bring people in.
6. The course page, pricing page and checkout promise "mocks", "practice" and "feedback" without checking whether the content exists.
7. Tutor support is advertised, but the site has no way to deliver it (no tutor inbox or allowance tracking). Only the AI assistant and discussions exist.
8. The case-study courses (OCS, MCS, SCS) have 6 lesson titles each. There is no pre-seen material, marked script or task practice.
9. Search engines may index "what's included" wording on paid pages that has no content behind it.
10. Missing pages can return a normal "OK" status to search engines instead of a "not found" status. This needs a hosting-level check.

### P2
11. Placeholder wording in `Contact.tsx`, `HelpCentre.tsx` and `OnboardingModal.tsx` needs one pass.
12. Desktop: the course-detail page is 40KB of code and pricing is 25KB. Split them into smaller pieces for easier upkeep and faster loading.
13. Accessibility: the major issues were fixed last pass. Re-check the new status labels and the admin area.
14. A development-only theme warning (`next-themes`).

## How the site compares with competitors (no copied wording, no invented services)

| Benchmark | What Finatix can honestly do now |
|---|---|
| Kaplan / aCOWtancy free trials and resources | BA1 and BA2 are already free with real question banks. Make that the main offer. |
| Astranti samples | Show one real sample lesson per paper, only once the lesson exists. |
| VIVA question depth | Show the real question count for each paper. Don't claim depth there isn't. |
| Learnsignal flexible subscription | Membership already exists. Make it clear which courses it covers today. |
| First Intuition study planning | `study_plans` and `study_goals` tables exist. Put them on the dashboard. |
| BPP mastery feedback | Syllabus mastery tracking exists. Show it only after at least 10 attempts. |
| BPP Pass Assurance, tutor support | **Do not offer** these until they are real services with written terms. |

## Implementation plan (desktop first, mobile kept basic)

### Phase 1: be honest about what exists (safe, no business decisions needed)
- Add one shared "content status" per course, worked out from live data: lesson text, videos, question count, and whether mocks are ready.
- Course pages, the catalogue and pricing then show "Content in development" for courses with no content. "What's included" lists only what actually exists.
- For empty courses, the buy button changes to "Register interest", using the existing interest form. This depends on Blocker 1.
- Remove the random progress figure and the demo filter, or retire `DashboardRedesigned.tsx` if nothing links to it.
- Readiness, mastery and mock cards show a clear "Not enough attempts yet" message instead of numbers.
- Move every contact email into `company.ts` and use it everywhere. Switch the domain once you confirm it.

### Phase 2: make the free courses convert
- Put BA1 and BA2 front and centre as the free starting point. Show real question counts and one real sample question (the existing TryQuestion).
- Hide BA3 and BA4 practice mode until they have enough questions.
- Dashboard for new learners: a "continue" card, a study-plan setup using the existing tables, and weak areas shown only once there are enough attempts.

### Phase 3: desktop course quality and trust
- Split course detail and pricing into smaller parts, and add a sticky summary panel on desktop.
- Lesson reader: when the text is empty, the page says so plainly and links to the resources and questions.
- Admin: add a content-readiness report per course (lessons with text, videos, questions per syllabus area, mocks). Paid sales for a course switch on only when it passes.

### Phase 4: checks
- Automated tests for content status, CTA states and the readiness message.
- Playwright tests at 1440px and 1024px, plus a basic 375px check.
- Re-run the SEO and security scans. Stripe test mode only, no live payments.

## Blockers needing business information
1. **Paid sales for empty courses.** Pause them, switch to pre-order or register interest, or keep selling with clear "in development" wording. Existing buyers keep their access either way.
2. **Content source.** Who writes and reviews the E, P, F and case-study content, and by when?
3. **Email domain.** Is it .com or .io, and are the support, legal and privacy mailboxes live?
4. **Tutor support.** Is it a real service? If so, what is the allowance and response time? If not, remove it from every promise.
5. **Your relationship with CIMA, instructors, testimonials, pass rates and company details.** All of these are still missing. Their sections stay hidden until you supply evidence.
6. **Refunds for past buyers** of empty courses. This is your call. Nothing will change automatically.

## Technical details
- Files: `src/lib/catalogue.ts`, a new `src/lib/contentStatus.ts` (or a read-only database function that returns counts per course), `CourseDetail.tsx`, `CoursePreview.tsx`, `Courses.tsx`, `Pricing.tsx`, `CheckoutPay.tsx`, `DashboardRedesigned.tsx`, `CurrentCourseCard.tsx`, `ReadinessScoreCard.tsx`, `SyllabusMasteryCard.tsx`, `company.ts`, the three policy pages, and a new admin readiness tab.
- The content status must be checked on the server as well, so `create-checkout` refuses courses flagged as not for sale. The browser alone can't be trusted with this.
- No changes to prices, subscriptions, historical purchases or entitlements. No deployment.
