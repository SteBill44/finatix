/**
 * Only allow Stripe to send buyers back to our own checkout return page on an
 * approved origin. Anything else is rejected so the endpoint can't be used as
 * an open redirect.
 */
const EXACT_ORIGINS = new Set([
  "https://finatix.io",
  "https://www.finatix.io",
  "https://finatix.lovable.app",
]);
const PREVIEW_PATTERNS = [
  /^https:\/\/[a-z0-9-]+--5702bce9-cae6-49fe-a331-a24217d805f0\.lovable\.app$/,
  /^https:\/\/5702bce9-cae6-49fe-a331-a24217d805f0\.lovableproject\.com$/,
  /^http:\/\/localhost:\d+$/,
];

export function isAllowedReturnUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw.replace("{CHECKOUT_SESSION_ID}", "x"));
  } catch {
    return false;
  }
  const origin = url.origin;
  const originOk = EXACT_ORIGINS.has(origin) || PREVIEW_PATTERNS.some((p) => p.test(origin));
  const pathOk = url.pathname === "/checkout/return" || url.pathname === "/dashboard";
  return originOk && pathOk && !url.username && !url.password;
}
