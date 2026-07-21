import { supabase } from "@/integrations/supabase/client";

/**
 * Given a stored Supabase Storage URL (public or otherwise) for the
 * `lesson-videos` or `resources` bucket, return a short-lived signed URL.
 * If the URL doesn't match a known private bucket, it is returned unchanged.
 */
const PRIVATE_BUCKETS = ["lesson-videos", "resources"] as const;

export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  try {
    const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?.*)?$/);
    if (!match) return null;
    return { bucket: match[1], path: decodeURIComponent(match[2]) };
  } catch {
    return null;
  }
}

export async function resolveStorageUrl(url: string | null | undefined, expiresIn = 3600): Promise<string | null> {
  if (!url) return null;
  const parsed = parseStorageUrl(url);
  if (!parsed) return url;
  if (!PRIVATE_BUCKETS.includes(parsed.bucket as (typeof PRIVATE_BUCKETS)[number])) return url;

  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
