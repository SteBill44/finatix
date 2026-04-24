/**
 * Shared rate-limit helper for edge functions.
 * Calls the existing `check_rate_limit` RPC and, when blocked, returns a
 * pre-built 429 Response with `Retry-After`.
 *
 * Returns null when the request is allowed (caller proceeds normally).
 */
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { errorResponse } from "./response.ts";

export interface RateLimitOptions {
  userId: string;
  actionType: string;
  maxPerMinute: number;
  maxPerHour: number;
  blockedMessage?: string;
}

export async function enforceRateLimit(
  client: SupabaseClient,
  corsHeaders: Record<string, string>,
  opts: RateLimitOptions
): Promise<Response | null> {
  const { data: result, error } = await client.rpc("check_rate_limit", {
    p_user_id: opts.userId,
    p_action_type: opts.actionType,
    p_max_per_minute: opts.maxPerMinute,
    p_max_per_hour: opts.maxPerHour,
  });

  // If the RPC itself errors, fail open (matches existing behaviour in
  // validate-practice-answer which only blocks when result.allowed === false).
  if (error || !result || result.allowed) return null;

  return errorResponse(
    opts.blockedMessage ?? "Too many requests. Please slow down.",
    429,
    corsHeaders,
    { "Retry-After": String(result.retryAfter ?? 60) }
  );
}
