# Finatix site audit and implementation record — 2026-09-28

Scope: desktop first, with basic mobile checks. Existing buyers' entitlements, prices, lesson content and the billing environment were left as they were. No live payments, refunds, subscription changes or publishing.

## 1. Evidence: what content actually exists (live database, queried during this audit)

| Measure | Value |
|---|---|
| Courses | 16 (4 free Certificate BA1–BA4, 12 paid at £199) |
| Lesson records | 216 (Certificate 70, Operational 51, Management 48, Strategic 47) |
| Paid-course lessons with written content | 0 (all 12 paid courses have lesson titles/outlines only) |
| Certificate lessons with substantial written content (≥1,500 chars) | effectively none; one BA1 video record |
| Question banks | BA1 ≈180 lesson-quiz questions + 9 practice; BA2 ≈180 + 8; BA3 5 practice; BA4 0; paid courses 0 |
| Mock exam records | 5 per course, **each with 0 questions attached** → 0 usable mocks |
| Lesson downloads | 33 listed; **all point to `example.com` placeholders**; no matching storage files |
| Course reviews / testimonials | 0 / none verified |

Conclusion: the site advertised lessons, mocks and downloads that don't exist for sale. BA1/BA2 practice question banks are the only material that's substantial and genuinely usable.

## 2. Findings by severity

**P0**
- Paid products were for sale with no teaching content → buyers would pay for empty courses. *Fixed: server sale gate.*
- The checkout accepted any return address (possible open redirect). *Fixed: allowlist.*
- The checkout could show a price taken from the web address as "Total due today". *Fixed: only the server-checked price is shown; checkout doesn't proceed if that check fails.*

**P1**
- Homepage/SEO claims: "real exam questions", mocks and lessons for every course, a native app, AI adaptation, tutoring. *Fixed or removed.*
- The CIMA ID was required at some sign-up and profile gates but not others. *Made optional everywhere; names are still required.*
- `/courses?level=…&q=…` filters were ignored, and the back button lost the filter state. *Fixed.*
- Readiness and mastery cards showed scores based on very little data. *Now they show an "insufficient data" state and a note that they don't predict exam results.*
- An unused page file (`DashboardRedesigned.tsx`) contained random progress values. It wasn't routed, so there's **no evidence the live dashboard ever showed random scores**. It was deleted as dead code.
- Course cards showed invented 30-hour durations; the About page used hard-coded platform totals. *Removed or replaced with live counts.*
- The pricing text said "Everything you need to become CIMA qualified", but official exams and practical experience are separate. *Reworded.*

**P2**
- Empty lessons said "content will be available here" and linked to placeholder downloads. *Now they point to real practice or back to the course, and placeholder downloads are hidden.*
- Admins couldn't see why a course wasn't ready for sale. *Added a sale-readiness table.*

## 3. Changes made

- Database: added `course_editorial_approvals` (admin-writable) and `get_course_content_status()`, which returns counts per course: lesson records, substantive lessons, real videos, questions, real and placeholder downloads, mocks, usable mocks (≥20 questions), approval, prerequisites and `on_sale`.
- Sale rule (revised in the final review, migration `0002_course_readiness_distinct_taught_lessons`): a paid course needs explicit editorial approval **and** the internal checks below. `taught_lessons` counts **distinct** lessons that have ≥1,500 characters of text **or** a real video; it must equal the number of lesson records. The earlier `substantive + videos` sum double-counted a lesson that had both, which could let an empty lesson through. That's now fixed and implemented in `lesson_is_taught()` and `evaluate_course_readiness()`.
- The 100-question and 20-question-mock thresholds are **internal, provisional launch checks**. They aren't CIMA requirements, realistic full mock sizes or evidence of academic quality, and meeting them doesn't mean a course is "complete". Final sale still needs academic review and approval.
- Case studies (OCS/MCS/SCS) are **always blocked** (`blocked_reason = case_study_policy_pending`) until a case-specific readiness policy exists. They need written case tasks, sitting-specific pre-seen work and reviewed marking and feedback; objective-question counts don't apply. The admin table explains this. No teaching content was invented.
- Every paid course is currently **not on sale** (live check: 0 on sale).
- Server (deployed to the backend, not published): `create-checkout` rejects unapproved courses, bundles and memberships that include them (HTTP 409), plus return addresses that aren't on the allowlist. `payments-catalogue` reports `available:false / content_not_ready`. Files: `supabase/functions/_shared/saleReadiness.ts`, `returnUrl.ts`, `checkout_guards_test.ts`. Webhook fulfilment and entitlement functions are **unchanged**, so existing purchases keep their access.
- Frontend: `useCourseContentStatus`, `ContentStatusBadge/Notice`, and interest registration through the existing `interest_registrations` table (errors are shown, never faked as success). Updated: `Courses.tsx` (URL filters, retry, no-results), `CourseDetail.tsx`, `Pricing.tsx`, `CheckoutPay.tsx` (fails closed; "Price when it opens"), `StripeEmbeddedCheckout.tsx` (clear message when a product isn't on sale), `Lesson.tsx`, `lib/profile.ts`, `App.tsx`, `CompleteProfile.tsx`, `CIMAProfileModal.tsx`, `SignupForm.tsx`, `useCIMAProfile.ts`, `ReadinessScoreCard.tsx`, `SyllabusMasteryCard.tsx`, `usePlatformFacts.ts`, `About.tsx`, homepage `Hero/CTA/HowToBegin`, `Contact.tsx`, `catalogue.ts`, `index.html`, `SEOHead.tsx`, `llms.txt`, `PracticeMode.tsx`, `admin/SaleReadinessPanel.tsx` + `Admin.tsx`.
- Kept as they were: prices, the refund wording, support email addresses (`support@finatix.com` wasn't guessed as .io) and the independence disclosures.

## 4. Tests actually run

- Deno: `checkout_guards_test.ts` (7) + `grading_test.ts` (9): **16 passed**.
- Vitest full suite: **189 passed** (9 files), including the new `auditRegression.test.ts` (profile without a CIMA ID, purchase CTA rules, admin gap list) and `Courses.urlFilters.test.tsx` (`?level=management`, `?q=`, invalid level).
- Type check (`tsgo`): clean.
- Final review: SQL regression with two lessons (one with ≥1,500 characters **and** a video, one empty). Result: `taught=1`, old double-count=2. Old logic said **ready (the bug)**; new logic says **not ready**. A case study with all counts satisfied says **not ready**. Live courses on sale: **0**.
- Vitest after the final review: **193 passed** (added: distinct-lesson regression, case-study gap, stale/failed/re-checking price never confirmed, unavailable subscription never says "taken today"). Deno: **16 passed**.
- `npm run build`: **vite build succeeded (exit 0)**, with only chunk-size warnings. The following prerender step was **skipped** because its Playwright browser binary wasn't installed in the build sandbox, so the pre-rendered HTML wasn't regenerated in this run. The hosted build environment should be checked.
- Preview screenshot at 1440 px of the monthly membership checkout: shows "Price when it opens £49" and "Not open for purchase yet, so nothing is charged now…"; the words "taken today" don't appear.
- Live backend calls (no payment): E1 single course, complete bundle and monthly membership each returned **409 not_available**. A foreign return URL returned **400**. The catalogue reported `available:false, content_not_ready` at £199 one-time.
- Playwright at 1440, 1024 and 375 px: home, `/courses?level=management`, E1 detail, pricing and checkout. No page errors. No "real exam questions" or "Total due today" for unavailable products. The price from the web address (`price=1`) was ignored.

## 5. Unresolved launch blockers (owner)

1. Write and review lessons for the 12 paid courses, attach questions (≥100) and one or more usable mocks, then approve each course in Admin → Content status.
2. Replace the 33 placeholder downloads with real files.
3. Add questions to BA3/BA4 and write BA1–BA4 lesson text.
4. Confirm the support mailbox domain (.com vs .io).
5. Supply verified instructors, testimonials and pass-rate evidence before showing any.
6. Finatix can launch as an **independent** provider (the current disclosures say so). Written evidence is needed only **if** any affiliation, approval or partnership is ever claimed.
7. Confirm exam sittings for the case-study journey, and write a case-study readiness policy (tasks, pre-seen, marking and review workflow).
8. Syllabus: the CGMA 2026 syllabus upgrade is examined from the May 2026 case study sitting ([AICPA & CIMA upgrade page](https://www.aicpa-cima.com/resources/landing/cgma-professional-qualification-upgrade-2026-for-candidates); [syllabus download](https://www.aicpa-cima.com/resources/download/cgma-professional-qualification-syllabus); [2026–27 blueprint changes](https://www.aicpa-cima.com/resources/download/summary-of-changes-for-2026-2027-cgma-pq-blueprints)). **Lesson-by-lesson verification against it is still pending** for every course.

## 6. Competitor comparison (Primary-page research verified during this audit, 28 Sep 2026)

These are what each provider publicly advertises. They weren't independently audited, and no paid courses were evaluated.

| Provider | Advertised offering | Finatix gap | Action |
|---|---|---|---|
| Kaplan ([certificate](https://kaplan.co.uk/courses/cima/certificate), [free trial](https://kaplan.co.uk/courses/free-trials/cima)) | Classroom, Live Online, OnDemand, Distance Learning; official approved materials; free trial | One self-study format; no official materials | Make the free BA1/BA2 practice the "trial"; state the study format plainly; never imply official materials |
| BPP ([CIMA](https://www.bpp.com/accountancy-and-tax/cima)) | Pass Assurance extension (subject to terms); mastery feedback | No guarantee scheme; feedback limited to per-question explanations | Keep per-question explanations prominent; don't offer any guarantee without written terms |
| Astranti ([CIMA](https://www.astranti.com/cima/)) | Free Certificate resources; mocks; premium tutors and mentors | No usable mocks; no tutors | Build real mocks before selling; don't advertise tutor support |
| First Intuition ([online courses](https://www.firstintuition.co.uk/ways-to-study/online-courses/)) | Study planning; tutor-supported online options | The study planner exists but isn't highlighted; no tutors | Surface the study plan tool; no tutor claims |
| VIVA ([CIMA](https://www.vivatuition.com/cima)) | All Access covering 12 professional courses; Elite includes personalised mock marking | Our membership bundles courses that have no content yet | Keep membership closed until the included courses are ready; no marking claims |
| Learnsignal ([CIMA](https://www.learnsignal.com/cima/)) | Subscription; weekly webinars; tutor support; free start | Subscription exists but is closed; no webinars | Reopen the subscription only once it has content; free start via BA1–BA4 |
| CIMAstudy ([site](https://cimastudy.com/)) | Includes CGMA Study Hub resources | No official resources | Link students to official AICPA & CIMA resources where appropriate |
| aCOWtancy ([site](https://www.acowtancy.com/)) | Free signup and resources; personalised support (live teaching not inferred) | Free resources limited to BA1/BA2 banks | Expand free BA3/BA4 practice |
| OpenTuition ([CIMA](https://opentuition.com/cima/)) | Free notes, lectures, chapter tests | Free notes missing (BA lessons are outlines) | Write BA1–BA4 notes first; this is the lowest-cost credibility gain |

Opportunity: honest availability, free and reachable exam-style practice with explanations, clear syllabus mapping (once verified against 2026) and useful study guidance.

## 7. Analytics baseline (Lovable analytics, 28 Aug–28 Sep 2026 UTC)

55 visitors, 176 pageviews, reported bounce rate 70%, devices 42 desktop / 12 mobile. The sample is small and may include internal visits, so **no conversion conclusions are drawn**. Use it as a starting point to compare against after launch.

## 8. Known limitations of this audit

- No exhaustive penetration test; the security review covered specific access rules and the checkout.
- No authenticated, end-to-end purchase in this round. Checkout refusals were checked with direct backend calls only, and no payment was made.
- No paid competitor courses were evaluated; the comparison uses public pages.
- No field audit of search performance (for example Search Console rankings or Core Web Vitals from real users).
- The prerender step didn't run during the local production build (see section 4).
- The frontend isn't published. The backend checkout functions and database rules are already live, which is how the current purchase block is enforced.
