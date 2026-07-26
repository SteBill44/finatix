/**
 * Google Analytics 4 helper.
 *
 * - Loads the gtag.js snippet on demand (only after cookie consent is granted).
 * - Provides typed helpers for pageviews and funnel events.
 * - Safe no-op if GA_MEASUREMENT_ID is not configured or consent is missing.
 */
import { GA_MEASUREMENT_ID, isAnalyticsConfigured } from "@/config/analytics";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let loaded = false;
let loading: Promise<void> | null = null;

export function loadGA(): Promise<void> {
  if (!isAnalyticsConfigured()) return Promise.resolve();
  if (loaded) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise((resolve) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => {
      loaded = true;
      resolve();
    };
    script.onerror = () => resolve();
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false, // we handle SPA pageviews manually
      anonymize_ip: true,
    });
  });

  return loading;
}

export function trackPageview(path: string, title?: string) {
  if (!isAnalyticsConfigured() || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: title ?? document.title,
  });
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
) {
  if (!isAnalyticsConfigured() || !window.gtag) return;
  window.gtag("event", name, params);
}

export function setAnalyticsUser(userId: string | null) {
  if (!isAnalyticsConfigured() || !window.gtag) return;
  window.gtag("set", { user_id: userId ?? undefined });
}

// Funnel event helpers -----------------------------------------------------

export const funnel = {
  landing: (params: { path: string; referrer?: string; utm?: Record<string, string> }) =>
    trackEvent("landing_view", {
      page_path: params.path,
      referrer: params.referrer || document.referrer || "(direct)",
      ...params.utm,
    }),

  courseViewed: (params: { course_id: string; course_title?: string; level?: string }) =>
    trackEvent("view_course", params),

  signupStarted: (method: "email" | "google" | "apple" = "email") =>
    trackEvent("sign_up_started", { method }),

  signupCompleted: (method: "email" | "google" | "apple" = "email") =>
    trackEvent("sign_up", { method }),

  enroll: (params: { course_id?: string; item_name?: string; value?: number; currency?: string }) =>
    trackEvent("enroll_course", { currency: "GBP", ...params }),

  purchase: (params: { transaction_id?: string; value: number; currency?: string; items?: unknown[] }) =>
    trackEvent("purchase", { currency: "GBP", ...params }),
};

// Extract UTM params from the current URL. Returns only present keys.
export function getUtmParams(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const p = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
      const v = p.get(k);
      if (v) out[k] = v;
    });
  } catch {
    /* ignore */
  }
  return out;
}
