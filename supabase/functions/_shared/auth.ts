/**
 * Shared auth helper for edge functions.
 *
 * Returns either:
 *   - { user, userClient, adminClient } on success, or
 *   - { response } — a ready-to-return 401 Response on failure.
 *
 * Behaviour notes:
 *   - Missing/invalid Authorization header → 401 with `{ error: "Not authenticated" | "Invalid token" }`
 *     so callers stay wire-compatible with their previous responses.
 *   - `userClient` carries the caller's JWT (use for RLS-bound reads/writes).
 *   - `adminClient` uses the service role (use only when bypassing RLS is required).
 */
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthSuccess {
  user: { id: string; email?: string };
  userClient: SupabaseClient;
  adminClient: SupabaseClient;
}

export interface AuthFailure {
  response: Response;
}

export async function authenticate(
  req: Request,
  corsHeaders: Record<string, string>,
  opts?: { invalidTokenMessage?: string }
): Promise<AuthSuccess | AuthFailure> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      response: new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ),
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) {
    return {
      response: new Response(
        JSON.stringify({ error: opts?.invalidTokenMessage ?? "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ),
    };
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  return { user: { id: user.id, email: user.email }, userClient, adminClient };
}

export function isAuthFailure(result: AuthSuccess | AuthFailure): result is AuthFailure {
  return (result as AuthFailure).response !== undefined;
}
