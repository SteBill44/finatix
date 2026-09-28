/**
 * Checkout only opens payment when the latest server price check succeeded,
 * nothing is being re-checked, and the product is approved for sale.
 * Stale successful data after a failed re-check must never allow payment.
 */
export function isPriceConfirmed(s: {
  available?: boolean | null;
  amount?: number | null;
  checking: boolean;
  rechecking: boolean;
  failed: boolean;
}): boolean {
  return Boolean(s.available) && s.amount != null && !s.failed && !s.checking && !s.rechecking;
}

/** Billing wording. Never promises a charge today for something not on sale. */
export function subscriptionTerms(price: string, interval: string, onSale: boolean): string {
  return onSale
    ? `This is a subscription. ${price} is taken today and then automatically every ${interval} until you cancel. You can cancel any time and keep access until the end of the period you've paid for.`
    : `Not open for purchase yet, so nothing is charged now. When it opens, it will be a subscription of ${price} per ${interval}, renewing automatically until you cancel.`;
}
