/**
 * Verified business identity and support details.
 *
 * Only put facts in here that the owner has confirmed. Anything unconfirmed
 * stays `null` and the pages that use it hide that detail rather than showing
 * a placeholder. Never invent an address, company number or accreditation.
 */

export const COMPANY = {
  name: "Finatix",
  /** The website's own domain. */
  website: "https://finatix.io",
  /** General enquiries. Confirmed by the owner as the published address. */
  contactEmail: "hello@finatix.com",
  /** Help with an account, a purchase or the courses. */
  supportEmail: "support@finatix.com",
  /** Legal and privacy enquiries. */
  legalEmail: "legal@finatix.com",
  privacyEmail: "privacy@finatix.com",
  supportHours: "Monday to Friday, 9am to 5pm (UK time)",
  responseTime: "Within 24 - 48 hours on working days",
  /**
   * Not published yet: the owner has not supplied a verified trading address
   * or registered company details. Leave as null - do not substitute an
   * example address.
   */
  address: null as null | {
    street: string;
    locality: string;
    postalCode: string;
    country: string;
  },
  companyNumber: null as string | null,
  vatNumber: null as string | null,
} as const;

/**
 * Things about the platform that can be checked by looking at the site itself.
 * Update these when content is added; never round them up.
 */
export const PLATFORM_FACTS = {
  courses: 16,
  qualificationLevels: 4,
  lessons: 216,
  practiceQuestions: 382,
} as const;

export function mailto(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ""}`;
}
