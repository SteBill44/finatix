import { useCallback, useMemo, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface StripeEmbeddedCheckoutProps {
  priceId: string;
  courseId?: string;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
}

export function StripeEmbeddedCheckout({
  priceId,
  courseId,
  customerEmail,
  userId,
  returnUrl,
}: StripeEmbeddedCheckoutProps) {
  const [failed, setFailed] = useState(false);
  // Bumping this forces a brand new payment session (stale sessions expire
  // and make Stripe render "Something went wrong").
  const [attempt, setAttempt] = useState(0);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    setFailed(false);
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        priceId,
        courseId,
        customerEmail,
        userId,
        returnUrl: returnUrl ??
          `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        environment: getStripeEnvironment(),
      },
    });
    if (error || !data?.clientSecret) {
      setFailed(true);
      throw new Error(error?.message || data?.error || "Failed to start checkout");
    }
    return data.clientSecret;
  }, [priceId, courseId, customerEmail, userId, returnUrl]);

  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

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
