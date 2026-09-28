/**
 * One rule for "profile complete", used by every gate (sign-in redirect,
 * complete-profile page, enrolment modal). Names are required; the CIMA ID is
 * optional because many beginners register before they have one.
 */
export interface ProfileNames {
  first_name?: string | null;
  last_name?: string | null;
  cima_id?: string | null;
}

export function isProfileComplete(p?: ProfileNames | null): boolean {
  return Boolean(p?.first_name?.trim() && p?.last_name?.trim());
}

/** Empty strings are stored as null so "no CIMA ID yet" is unambiguous. */
export function normaliseCimaId(v?: string | null): string | null {
  const t = (v ?? "").trim();
  return t ? t.slice(0, 20) : null;
}
