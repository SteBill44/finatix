import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import StripeEmbeddedCheckout from "@/components/StripeEmbeddedCheckout";
import PaymentTestModeBanner from "@/components/PaymentTestModeBanner";
import { isPaymentsConfigured } from "@/lib/stripe";
import { useVerifiedPrice } from "@/hooks/useVerifiedPrice";
import { POLICY, formatPrice } from "@/lib/catalogue";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The dedicated checkout page used for every course and bundle purchase.
 * Details of what's being bought arrive as query parameters so the page can be
 * refreshed, shared or reached straight from a link.
 */
const CheckoutPay = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [guestEmail, setGuestEmail] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const priceId = params.get("priceId");
  const title = params.get("title") || "Complete your purchase";
  const price = Number(params.get("price") || 0);
  const courseId = params.get("courseId") || undefined;
  const bundleLabel = params.get("bundle") || undefined;
  const courseSlug = params.get("slug") || undefined;
  const courseIds = useMemo(() => {
    const raw = params.get("courses");
    return raw ? raw.split(",").filter(Boolean) : undefined;
  }, [params]);
  // The real price comes from our payment provider, never from the link, so
  // the total shown here is always the total that gets charged.
  const { data: verified, isLoading: checkingPrice, isError: priceCheckFailed } =
    useVerifiedPrice(priceId);

  const verifiedAmount = verified?.amount ?? null;
  const currency = verified?.currency ?? "GBP";
  const isSubscription = verified?.billingType === "subscription";
  const intervalLabel = verified?.interval === "year" ? "year" : "month";
  const courseCount = verified?.courseCount || courseIds?.length || 1;
  const productUnavailable = verified?.available === false || priceCheckFailed;

  const paymentsReady = isPaymentsConfigured();
  const guestEmailValid = EMAIL_RE.test(guestEmail.trim());
  const checkoutEmail = user?.email ?? (guestEmailValid ? guestEmail.trim() : undefined);
  const canContinue =
    Boolean(priceId) &&
    !productUnavailable &&
    !checkingPrice &&
    (Boolean(user) || guestEmailValid);

  const returnUrl = `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}${
    courseSlug ? `&course=${courseSlug}` : ""
  }`;

  if (!priceId) {
    return (
      <Layout>
        <SEOHead title="Checkout" noIndex />
        <div className="pt-28 pb-16 container mx-auto px-4 max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-2">Nothing to pay for yet</h1>
          <p className="text-muted-foreground mb-6">
            Pick a course or a bundle and you'll be brought straight back here.
          </p>
          <Button asChild>
            <Link to="/courses">Browse courses</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title="Checkout" noIndex />
      <div className="pt-24 lg:pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            The price shown is the price you pay - VAT included, no extras at the end.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Payment */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <Card className="border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment
                  </CardTitle>
                  <CardDescription>
                    {user
                      ? `Paying with the email on your account (${user.email}).`
                      : "No account needed to buy - you can set one up straight after paying."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PaymentTestModeBanner />

                  {!paymentsReady ? (
                    <p className="text-sm text-muted-foreground">
                      Payments aren't available right now. Please try again shortly.
                    </p>
                  ) : showPayment && canContinue ? (
                    <StripeEmbeddedCheckout
                      priceId={priceId}
                      courseId={courseId}
                      courseIds={courseIds}
                      bundleLabel={bundleLabel}
                      customerEmail={checkoutEmail}
                      returnUrl={returnUrl}
                    />
                  ) : (
                    <div className="space-y-4">
                      {!user && (
                        <div className="space-y-2">
                          <Label htmlFor="checkout-email">Your email address</Label>
                          <Input
                            id="checkout-email"
                            type="email"
                            placeholder="you@example.com"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            If this email already has an account, your courses are added to it -
                            otherwise you'll be invited to create one right after payment.
                          </p>
                        </div>
                      )}
                      <Button
                        className="w-full"
                        size="lg"
                        disabled={!canContinue}
                        onClick={() => setShowPayment(true)}
                      >
                        Continue to payment
                      </Button>
                    </div>
                  )}

                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="w-3.5 h-3.5" />
                    Payments are processed securely by Stripe. We never see your card details.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card className="lg:sticky lg:top-28">
                <CardHeader>
                  <CardTitle className="text-base">Order summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium leading-snug">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {courseCount > 1
                          ? `${courseCount} courses - lifetime access`
                          : "One-time purchase - lifetime access"}
                      </p>
                    </div>
                    {price > 0 && (
                      <span className="text-sm font-semibold whitespace-nowrap">
                        £{price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total due today</span>
                    <span className="text-2xl font-bold">
                      {price > 0 ? `£${price.toLocaleString()}` : "-"}
                    </span>
                  </div>
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary" />
                    VAT included. Lifetime access to everything in this purchase.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPay;
