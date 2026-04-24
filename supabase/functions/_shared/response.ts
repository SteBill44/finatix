/**
 * Shared response helpers for edge functions.
 * Centralises JSON envelope + CORS header merging so every function returns
 * the same shape and Content-Type.
 */

export function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export function errorResponse(
  message: string,
  status: number,
  corsHeaders: Record<string, string>,
  extraHeaders: Record<string, string> = {}
): Response {
  return jsonResponse({ error: message }, status, corsHeaders, extraHeaders);
}
