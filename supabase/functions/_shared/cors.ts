/**
 * Shared CORS helper for all edge functions.
 *
 * Reads SITE_URL (auto-set by Supabase) and an optional ALLOWED_ORIGINS
 * env var (comma-separated list of additional allowed origins).
 * Only reflects the request Origin header if it matches the allowlist.
 * Localhost is always permitted for local development.
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const requestOrigin = req.headers.get("Origin") || "";

  const siteUrl = Deno.env.get("SITE_URL") || "";
  const extraOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = new Set<string>([
    siteUrl,
    ...extraOrigins,
  ].filter(Boolean));

  const isLocalhost =
    requestOrigin.startsWith("http://localhost") ||
    requestOrigin.startsWith("http://127.0.0.1");

  const isAllowed = isLocalhost || allowedOrigins.has(requestOrigin);
  const allowedOrigin = isAllowed ? requestOrigin : (siteUrl || "");

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
}

export function corsResponse(req: Request, status = 204): Response {
  return new Response(null, { status, headers: getCorsHeaders(req) });
}
