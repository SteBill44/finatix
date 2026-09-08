import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StripeEmbeddedCheckout from "@/components/StripeEmbeddedCheckout";
import PaymentTestModeBanner from "@/components/PaymentTestModeBanner";
import { useAuth } from "@/contexts/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Stripe lookup key for the item being bought. */
  priceId: string | null;
  /** Single course purchase. */
  courseId?: string;
  /** Bundle purchase: every course included. */
  courseIds?: string[];
  /** Short label stored with a bundle purchase (e.g. "Operational Level Bundle"). */
  bundleLabel?: string;
  /** Heading shown at the top of the dialog. */
  title: string;
  /** Price in pounds, shown in the summary line. */
  price?: number;
  /** Number of courses included, shown for bundles. */
  courseCount?: number;
  /** Optional extra line under the price summary. */
  summary?: string;
  /** Where Stripe sends the buyer once payment completes. */
  returnUrl?: string;
}

/**
 * The single payment window used everywhere on the site: individual courses,
 * level bundles and the all-courses bundle. Signed-in buyers pay straight away
 * with the email on their account; guests give an email and are matched to an
 * account (or invited to create one) after paying.
 */
const PurchaseDialog = ({
  open,
  onOpenChange,
  priceId,
  courseId,
  courseIds,
  bundleLabel,
  title,
  price,
  courseCount,
  summary,
  returnUrl,
}: PurchaseDialogProps) => {
  const { user } = useAuth();
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    if (!open) setGuestEmail("");
  }, [open]);

  const guestEmailValid = EMAIL_RE.test(guestEmail.trim());
  const checkoutEmail = user?.email ?? (guestEmailValid ? guestEmail.trim() : undefined);
  const readyToPay = Boolean(priceId) && (Boolean(user) || guestEmailValid);

  const defaultSummary = [
    price !== undefined ? `£${price.toLocaleString()}` : null,
    courseCount && courseCount > 1
      ? `one-time purchase, lifetime access to all ${courseCount} courses`
      : "one-time purchase, lifetime access",
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-t-4 border-t-primary">
        <DialogHeader className="px-6 pt-6 pb-4 bg-secondary/40 border-b border-border text-left">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>
            {summary ?? `${defaultSummary}. The price shown is the price you pay.`}
          </DialogDescription>
        </DialogHeader>
        <PaymentTestModeBanner />
        <div className="p-4 space-y-4">
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="purchase-guest-email">Your email address</Label>
              <Input
                id="purchase-guest-email"
                type="email"
                placeholder="you@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                No account needed to buy. If this email already has an account, your courses are
                added to it - otherwise you'll be invited to create one straight after payment.
              </p>
            </div>
          )}
          {open && priceId && readyToPay && (
            <StripeEmbeddedCheckout
              priceId={priceId}
              courseId={courseId}
              courseIds={courseIds}
              bundleLabel={bundleLabel}
              userId={user?.id}
              customerEmail={checkoutEmail}
              returnUrl={
                returnUrl ??
                `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`
              }
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDialog;
