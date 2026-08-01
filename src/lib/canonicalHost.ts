// Keeps the site on a single canonical host so search engines don't index
// duplicate content on alternate hosts (www / the *.lovable.app subdomain).
const CANONICAL_HOST = "finatix.io";

// Only these hosts get redirected. Preview hosts (id-preview--*.lovable.app)
// and localhost are intentionally left alone.
const ALTERNATE_HOSTS = ["www.finatix.io", "finatix.lovable.app"];

export function enforceCanonicalHost() {
  if (typeof window === "undefined") return;

  const { hostname, pathname, search, hash, protocol } = window.location;
  if (protocol !== "https:") return;
  if (!ALTERNATE_HOSTS.includes(hostname)) return;

  window.location.replace(
    `https://${CANONICAL_HOST}${pathname}${search}${hash}`,
  );
}
