# One purchase flow everywhere

Make every paid purchase work the same way the level bundles now do: anyone can pay
straight away, and the account is sorted out afterwards.

## What changes for buyers

- **Single courses on the pricing page** — the buy button opens the same payment
  window instead of sending people to the sign-in page.
- **Single courses on a course page** — already works this way; it will use the
  shared payment window so the look and wording match everywhere.
- **Membership plans (monthly / annual / lifetime)** — already guest friendly; moves
  to the same shared window so the email box, wording and styling are identical.
- **Level bundles and the all-courses bundle** — unchanged, already done.
- **Free certificate courses** — unchanged: people create an account first.

## Details we already hold

Signed-in buyers never re-enter anything: their email and CIMA details come straight
from their account, and the details form is not shown to them again. If someone's
CIMA details are missing, they are asked once **after** paying, before they open their
first lesson — never as a blocker to paying.

## After payment

Same as today: if the email matches an existing account, the courses are added to it
automatically. If not, the confirmation page invites them to create an account with
that email and everything unlocks on first sign-in.

## Technical notes

- New shared component `src/components/PurchaseDialog.tsx`: themed dialog with the
  test-mode banner, guest email capture with validation, price/VAT-inclusive summary,
  and `StripeEmbeddedCheckout`. Props: `priceId`, optional `courseId` / `courseIds` /
  `bundleLabel`, title, price, and course count.
- `src/pages/Pricing.tsx`: replace the bundle dialog markup with `PurchaseDialog`;
  change `handleEnroll` so paid courses open `PurchaseDialog` with that course's
  price ID (`getCoursePriceId`) instead of `navigate("/auth")`; free courses keep the
  existing sign-in path.
- `src/pages/CourseDetail.tsx`: swap the inline checkout dialog for `PurchaseDialog`;
  drop the CIMA modal from the pre-payment path (`handleEnroll` /
  `performEnrollment`) so payment is never gated by profile completeness.
- CIMA prompt moves to the point of starting a lesson: keep `CIMAProfileModal` but
  trigger it from the enrolled "Start learning" action when `hasCompleteProfile` is
  false, prefilled from the profile record.
- `src/pages/Checkout.tsx` (membership): reuse the same guest-email block/styling from
  `PurchaseDialog` for visual consistency; no change to the membership price IDs.
- No database or edge function changes needed — `create-checkout`, `payments-webhook`
  and `claim_guest_purchases` already cover single courses, bundles and memberships.
- Verify with a build plus a signed-out browser pass on `/pricing` and a paid course
  page, confirming the payment window opens rather than a redirect to sign-in.
