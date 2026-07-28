// Google Analytics 4 configuration.
// Paste your GA4 Measurement ID here (format: "G-XXXXXXXXXX").
// Leave empty to disable analytics.
export const GA_MEASUREMENT_ID = "G-7QPQE65W74";

export const isAnalyticsConfigured = () =>
  typeof GA_MEASUREMENT_ID === "string" && GA_MEASUREMENT_ID.startsWith("G-");
