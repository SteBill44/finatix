const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full bg-destructive/10 border-b border-destructive/30 px-4 py-2 text-center text-sm text-destructive">
        Payments are not live yet, so checkout is unavailable on this site.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full bg-accent/15 border-b border-accent/30 px-4 py-2 text-center text-sm text-foreground">
        Test mode - payments made here are not real charges.
      </div>
    );
  }
  return null;
}

export default PaymentTestModeBanner;
