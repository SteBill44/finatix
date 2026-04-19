import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Shield, ArrowLeft, Zap, Star, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PLANS = [
  {
    id: "monthly",
    name: "Monthly",
    price: 49,
    period: "month",
    badge: null,
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
    price: null,
    period: null,
    badge: "Custom",
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
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const plan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setLoading(true);
    try {
      // Record interest — payments backend coming soon
      const { error } = await supabase.from("interest_registrations").insert({
        email: email.trim(),
        full_name: fullName.trim(),
        course_id: null,
      });

      if (error && error.code !== "23505") throw error;
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <SEOHead title="Thank You" noIndex />
        <div className="pt-24 lg:pt-28 pb-12">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3">You're on the list!</h1>
            <p className="text-muted-foreground mb-2">
              Thanks for your interest in the <strong>{plan.name}</strong> plan. We're launching payments very soon.
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              We'll email <strong>{email}</strong> as soon as your subscription is ready to activate.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link to="/courses">
                <Button variant="outline">Browse Free Courses</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
              Payment processing is coming soon — register your interest and we'll notify you first.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {PLANS.map((p) => (
              <Card
                key={p.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === p.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedPlan(p.id)}
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
            {/* Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Register Your Interest
                  </CardTitle>
                  <CardDescription>
                    We'll notify you the moment the {plan.name} plan is available.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Smith"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    {selectedPlan === "corporate" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          placeholder="Acme Ltd"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                        />
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Submitting..." : `Register for ${plan.name} Plan`}
                    </Button>
                  </form>
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
                    Secure checkout with Stripe — coming soon
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
