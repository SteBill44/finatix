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
- The dashboard used random or demo progress. *Removed.*
- Course cards showed invented 30-hour durations; the About page used hard-coded platform totals. *Removed or replaced with live counts.*
- The pricing text said "Everything you need to become CIMA qualified", but official exams and practical experience are separate. *Reworded.*

**P2**
- Empty lessons said "content will be available here" and linked to placeholder downloads. *Now they point to real practice or back to the course, and placeholder downloads are hidden.*
- Admins couldn't see why a course wasn't ready for sale. *Added a sale-readiness table.*

## 3. Changes made

- Database: added `course_editorial_approvals` (admin-writable) and `get_course_content_status()`, which returns counts per course: lesson records, substantive lessons, real videos, questions, real and placeholder downloads, mocks, usable mocks (≥20 questions), approval, prerequisites and `on_sale`.
- Sale rule: a paid course needs explicit editorial approval **and** every lesson must have ≥1,500 characters or a real video, plus ≥100 questions and ≥1 usable mock. The text-length check only measures size and doesn't approve quality. Every paid course is currently **not on sale**.
- Server (deployed to the backend, not published): `create-checkout` rejects unapproved courses, bundles and memberships that include them (HTTP 409), plus return addresses that aren't on the allowlist. `payments-catalogue` reports `available:false / content_not_ready`. Files: `supabase/functions/_shared/saleReadiness.ts`, `returnUrl.ts`, `checkout_guards_test.ts`. Webhook fulfilment and entitlement functions are **unchanged**, so existing purchases keep their access.
- Frontend: `useCourseContentStatus`, `ContentStatusBadge/Notice`, and interest registration through the existing `interest_registrations` table (errors are shown, never faked as success). Updated: `Courses.tsx` (URL filters, retry, no-results), `CourseDetail.tsx`, `Pricing.tsx`, `CheckoutPay.tsx` (fails closed; "Price when it opens"), `StripeEmbeddedCheckout.tsx` (clear message when a product isn't on sale), `Lesson.tsx`, `lib/profile.ts`, `App.tsx`, `CompleteProfile.tsx`, `CIMAProfileModal.tsx`, `SignupForm.tsx`, `useCIMAProfile.ts`, `ReadinessScoreCard.tsx`, `SyllabusMasteryCard.tsx`, `usePlatformFacts.ts`, `About.tsx`, homepage `Hero/CTA/HowToBegin`, `Contact.tsx`, `catalogue.ts`, `index.html`, `SEOHead.tsx`, `llms.txt`, `PracticeMode.tsx`, `admin/SaleReadinessPanel.tsx` + `Admin.tsx`.
- Kept as they were: prices, the refund wording, support email addresses (`support@finatix.com` wasn't guessed as .io) and the independence disclosures.

## 4. Tests actually run

- Deno: `checkout_guards_test.ts` (7) + `grading_test.ts` (9): **16 passed**.
- Vitest full suite: **189 passed** (9 files), including the new `auditRegression.test.ts` (profile without a CIMA ID, purchase CTA rules, admin gap list) and `Courses.urlFilters.test.tsx` (`?level=management`, `?q=`, invalid level).
- Type check (`tsgo`): clean.
- Live backend calls (no payment): E1 single course, complete bundle and monthly membership each returned **409 not_available**. A foreign return URL returned **400**. The catalogue reported `available:false, content_not_ready` at £199 one-time.
- Playwright at 1440, 1024 and 375 px: home, `/courses?level=management`, E1 detail, pricing and checkout. No page errors. No "real exam questions" or "Total due today" for unavailable products. The price from the web address (`price=1`) was ignored.

## 5. Unresolved launch blockers (owner)

1. Write and review lessons for the 12 paid courses, attach questions (≥100) and one or more usable mocks, then approve each course in Admin → Content status.
2. Replace the 33 placeholder downloads with real files.
3. Add questions to BA3/BA4 and write BA1–BA4 lesson text.
4. Confirm the support mailbox domain (.com vs .io).
5. Supply verified instructors, testimonials and pass-rate evidence before showing any.
6. Written evidence of the relationship with CIMA.
7. Confirm exam sittings for the case-study journey.

## 6. Competitor comparison (observed public pages, fetched 2026-09-28)

| Provider | URL | Offerings seen on the public page |
|---|---|---|
| Kaplan | kaplan.co.uk/courses/cima/certificate, /courses/free-trials/cima | Page rendered client-side; the text couldn't be extracted automatically. Earlier research: clear study formats, official materials, free trials |
| BPP | bpp.com/accountancy-and-tax/cima | Tutor-led/live options, case study, subscription, Pass Assurance (conditional) |
| Astranti | astranti.com/cima/ | Mocks, tutor/mentor support, live sessions, case study, free resources |
| First Intuition | firstintuition.co.uk/programmes/cima/ | Free trial, live and on-demand, study planning |
| VIVA Tuition | vivatuition.com/cima | Mocks, live/on-demand, case study, subscription |
| Learnsignal | learnsignal.com/cima/ | Blocked by a bot checkpoint (HTTP 429); not verified this session |
| aCOWtancy | acowtancy.com | Free content, tutor/live elements |
| CIMAstudy | cimastudy.com | Page text couldn't be extracted; not verified |
| OpenTuition | opentuition.com/cima/ | Free notes, lectures and tests; case study |

These are keyword-level observations only. They aren't rankings, and no comparable prices are claimed. Opportunity for Finatix: clear syllabus coverage, free samples that are easy to reach (BA1/BA2 banks), honest availability, reliable marked practice and useful study guidance. Tutor support, live classes and pass guarantees shouldn't be claimed until they're delivered.
