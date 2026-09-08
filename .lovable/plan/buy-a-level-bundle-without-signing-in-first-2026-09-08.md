# Buy a level bundle without signing in first

Today the "Buy Level Bundle" button (and the "Buy All Courses" button below it) does not take a payment at all — it checks whether you are signed in, sends you to the sign-in page if you aren't, and simply enrols a signed-in person in the level's courses for free. This plan turns both into real, guest-friendly purchases.

## What the visitor will experience

1. Click "Buy Level Bundle" (or "Buy All Courses").
2. A payment panel opens straight away, in the site's own styling. If they aren't signed in, they type their email address first — no account needed.
3. They pay.
4. After payment:
   - If that email already belongs to an account, the courses are attached to it; signing in shows them unlocked.
   - If it doesn't, they see a "create your account with this email to unlock your courses" step, and the purchase attaches automatically the moment the account exists.

This matches how buying a single course already works.

## Pricing to confirm before building

- Operational / Management / Strategic level bundles: £499 each (as shown on the page today).
- All-courses bundle: £999 (as shown today).
- Certificate level is free, so it keeps the current "enrol" behaviour and no payment.

## Technical detail

**Payment prices**
- Verify in Stripe which bundle prices already exist. Known: `complete_cima_bundle_onetime` (created earlier at £499). Create/adjust so we have four VAT-inclusive GBP one-time prices: `bundle_operational_onetime`, `bundle_management_onetime`, `bundle_strategic_onetime` at £49900 and the all-courses bundle at £99900.
- Add a `BUNDLE_PRICE_IDS` map plus a `getBundlePriceId(level)` helper in `src/lib/coursePricing.ts`.

**Pricing page (`src/pages/Pricing.tsx`)**
- Replace `handleBuyLevelBundle` / `handleBuyAllCourses` free-enrolment logic with a bundle purchase dialog.
- New `BundleCheckoutDialog` component reusing `StripeEmbeddedCheckout` and the guest-email input pattern from `src/pages/Checkout.tsx` (email regex validation, `customerEmail={user?.email ?? guestEmail}`), themed like the course purchase dialog in `CourseDetail.tsx`.
- Keep the CIMA-profile modal only for the free Certificate-level enrol path; a guest cannot fill it pre-purchase.

**Checkout function (`supabase/functions/create-checkout/index.ts`)**
- Accept an optional `courseIds: string[]` (validated UUIDs, capped in length) and pass it into session metadata as a comma-separated `courseIds`, alongside a `bundleLevel` label. Existing single-`courseId` behaviour unchanged.

**Webhook (`supabase/functions/payments-webhook/index.ts`)**
- Where it currently handles one `courseId`, loop over `courseIds` when present: insert a `course_purchases` row per course (with `customer_email` when there's no user, as single-course guest purchases already do) and, if a user is resolved by email, insert the enrolments and send one "bundle unlocked" notification instead of one per course.

**Guest claiming**
- `claim_guest_purchases` already attaches purchases by email at sign-in and is called from `CheckoutReturn.tsx`; because each bundle course gets its own purchase row, no database function change is expected. Confirm this by reading the function definition before building, and extend it only if it grants a single course per row in a way that breaks on multiples.

**Verification**
- Build check, then a browser run: click Buy Level Bundle signed out, confirm the email step and payment panel appear (test mode), and confirm the post-payment path lands on the account-creation prompt.
