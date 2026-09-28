import { useCallback, useMemo, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface StripeEmbeddedCheckoutProps {
  priceId: string;
  courseId?: string;
  courseIds?: string[];
  bundleLabel?: string;
  customerEmail?: string;
  returnUrl?: string;
}

export function StripeEmbeddedCheckout({
  priceId,
  courseId,
  courseIds,
  bundleLabel,
  customerEmail,
  returnUrl,
}: StripeEmbeddedCheckoutProps) {
  const [failed, setFailed] = useState(false);
  const [notOnSale, setNotOnSale] = useState(false);
  // Bumping this forces a brand new payment session (stale sessions expire
  // and make Stripe render "Something went wrong").
  const [attempt, setAttempt] = useState(0);
  const courseIdsKey = courseIds?.join(",");

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    setFailed(false);
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId,
        courseId,
        courseIds,
        bundleLabel,
        customerEmail,
        returnUrl: returnUrl ??
          `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      // The server refuses products that aren't approved for sale (HTTP 409).
      let code: string | undefined = data?.error;
      try {
        const ctx = (error as { context?: Response } | null)?.context;
        if (ctx && typeof ctx.json === "function") code = (await ctx.clone().json())?.error ?? code;
      } catch { /* ignore */ }
      if (code === "not_available") setNotOnSale(true);
      setFailed(true);
      throw new Error(error?.message || data?.error || "Failed to start checkout");
    }
    return data.clientSecret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceId, courseId, courseIdsKey, bundleLabel, customerEmail, returnUrl]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  if (notOnSale) {
    return (
      <div role="alert" className="py-10 text-center space-y-2">
        <p className="text-sm font-medium text-foreground">This isn't open for purchase yet.</p>
        <p className="text-sm text-muted-foreground">
          Some of the course material it includes is still being written and reviewed. Nothing has been charged.
        </p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="py-10 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          We couldn't open the payment form. Please try again.
        </p>
        <Button onClick={() => { setFailed(false); setAttempt((a) => a + 1); }}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider key={attempt} stripe={getStripe()} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

export default StripeEmbeddedCheckout;
