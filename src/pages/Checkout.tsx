import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { funnel } from "@/lib/analytics";
import StripeEmbeddedCheckout from "@/components/StripeEmbeddedCheckout";
import PaymentTestModeBanner from "@/components/PaymentTestModeBanner";
import { isPaymentsConfigured } from "@/lib/stripe";
import { useSubscription } from "@/hooks/useSubscription";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    priceId: "all_access_monthly",
    price: 49,
    period: "month",
    badge: null as string | null,
    pricePerMonth: null as number | null,
    savings: null as string | null,
    features: [
      "Access to all CIMA courses",
      "Unlimited quiz attempts",
      "AI Study Tutor",
      "Flashcard system",
      "Progress analytics",
      "Community discussions",
    ],
  },
  {
    id: "annual",
    name: "Annual",
    priceId: "all_access_annual",
    price: 399,
    period: "year",
    badge: "Best Value",
    pricePerMonth: 33,
    savings: "Save £189",
    features: [
      "Everything in Monthly",
      "Priority support",
      "Mock exam access",
      "Downloadable resources",
      "Certificate of completion",
      "Early access to new content",
    ],
  },
  {
    id: "corporate",
    name: "Corporate",
    priceId: null as string | null,
    price: null as number | null,
    period: null as string | null,
    badge: "Custom",
    pricePerMonth: null as number | null,
    savings: null as string | null,
    features: [
      "Everything in Annual",
      "Bulk seat management",
      "Admin analytics dashboard",
      "Dedicated account manager",
      "Custom integrations",
      "Invoice billing",
    ],
  },
];

export default function Checkout() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultPlan = searchParams.get("plan") || "annual";

  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [showCheckout, setShowCheckout] = useState(false);
  const { isActive, openBillingPortal, isOpeningPortal } = useSubscription();

  const plan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];
  const paymentsReady = isPaymentsConfigured();

  const startCheckout = () => {
    funnel.enroll({ item_name: plan.name, value: plan.price ?? undefined, currency: "GBP" });
    setShowCheckout(true);
  };

  return (
    <Layout>
      <SEOHead title="Checkout" noIndex />
      <div className="pt-24 lg:pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Pricing
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Membership unlocks every course while it's active. Cancel any time - you keep access
              until the end of the period you've paid for.
            </p>
          </div>

          {isActive && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base">You already have an active membership</CardTitle>
                <CardDescription>
                  Manage your billing, payment card or cancellation any time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => openBillingPortal()} disabled={isOpeningPortal}>
                  {isOpeningPortal ? "Opening..." : "Manage membership"}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {PLANS.map((p) => (
              <Card
                key={p.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === p.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-primary/50"
                }`}
                onClick={() => {
                  setSelectedPlan(p.id);
                  setShowCheckout(false);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    {p.badge && (
                      <Badge variant={p.badge === "Best Value" ? "default" : "secondary"} className="text-xs">
                        {p.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    {p.price ? (
                      <div>
                        <span className="text-3xl font-bold">£{p.price}</span>
                        <span className="text-muted-foreground text-sm">/{p.period}</span>
                        {p.pricePerMonth && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                            £{p.pricePerMonth}/month · {p.savings}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-muted-foreground">Contact Us</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Payment */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {plan.priceId ? "Payment" : "Talk to us"}
                  </CardTitle>
                  <CardDescription>
                    {plan.priceId
                      ? `Pay securely for the ${plan.name} plan.`
                      : "Tell us about your team and we'll put together a quote."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!plan.priceId ? (
                    <Button asChild className="w-full">
                      <Link to="/contact">Contact us about Corporate</Link>
                    </Button>
                  ) : !user ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Please sign in first so we can link your membership to your account.
                      </p>
                      <Button asChild className="w-full">
                        <Link to="/auth">Sign in to continue</Link>
                      </Button>
                    </div>
                  ) : !paymentsReady ? (
                    <p className="text-sm text-muted-foreground">
                      Payments aren't available right now. Please try again later.
                    </p>
                  ) : showCheckout ? (
                    <div className="space-y-3">
                      <PaymentTestModeBanner />
                      <StripeEmbeddedCheckout
                        priceId={plan.priceId}
                        userId={user.id}
                        customerEmail={user.email ?? undefined}
                        returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
                      />
                    </div>
                  ) : (
                    <Button className="w-full" onClick={startCheckout}>
                      Continue to payment
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{plan.name} Plan</span>
                    {plan.price ? (
                      <span className="font-semibold">£{plan.price}/{plan.period}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Custom pricing</span>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    Secure checkout. The price shown is the final price - all taxes included.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
