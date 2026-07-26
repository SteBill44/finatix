import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { useAuth } from "@/contexts/AuthContext";
import { loadGA, trackPageview, funnel, getUtmParams, setAnalyticsUser } from "@/lib/analytics";
import { isAnalyticsConfigured } from "@/config/analytics";

/**
 * Wires Google Analytics into the SPA:
 * - Loads gtag.js after the user grants analytics consent.
 * - Emits a page_view on every route change.
 * - Emits a landing_view (with UTM/referrer) on the first tracked pageview.
 * - Associates the GA user_id with the signed-in Supabase user.
 */
const AnalyticsProvider = () => {
  const location = useLocation();
  const { preferences, consentStatus } = useCookieConsent();
  const { user } = useAuth();
  const firstView = useRef(true);
  const lastPath = useRef<string | null>(null);

  // Load GA once consent for analytics is granted.
  useEffect(() => {
    if (!isAnalyticsConfigured()) return;
    if (consentStatus === "accepted" || preferences.analytics) {
      loadGA();
    }
  }, [consentStatus, preferences.analytics]);

  // Track pageviews on every route change (once GA has been permitted).
  useEffect(() => {
    if (!isAnalyticsConfigured()) return;
    if (!preferences.analytics) return;
    const path = location.pathname + location.search;
    if (lastPath.current === path) return;
    lastPath.current = path;

    trackPageview(path);

    if (firstView.current) {
      firstView.current = false;
      funnel.landing({ path, utm: getUtmParams() });
    }
  }, [location.pathname, location.search, preferences.analytics]);

  // Attach signed-in user id to GA sessions.
  useEffect(() => {
    if (!isAnalyticsConfigured() || !preferences.analytics) return;
    setAnalyticsUser(user?.id ?? null);
  }, [user?.id, preferences.analytics]);

  return null;
};

export default AnalyticsProvider;
