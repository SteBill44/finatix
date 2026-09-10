/**
 * Instructor profiles.
 *
 * Add a person here ONLY when every field below has been confirmed by that
 * person: a real photograph they have agreed to publish, their real name, the
 * credentials they actually hold, and a lesson on this site they actually
 * teach. The instructor section is hidden entirely while this list is empty,
 * so an incomplete profile is never shown.
 */

export interface Credential {
  /** e.g. "CIMA (ACMA, CGMA)" */
  label: string;
  /** Body that awarded it, e.g. "Chartered Institute of Management Accountants" */
  awardedBy: string;
  /** Year awarded, when known. */
  year?: number;
  /** Public verification or membership page, when one exists. */
  verificationUrl?: string;
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  /** Photograph URL. Required - profiles without a real photo are not shown. */
  photoUrl: string;
  /** Short first-person biography. */
  bio: string;
  credentials: Credential[];
  /** e.g. "12 years teaching CIMA Management level" */
  teachingExperience: string;
  /** Subjects this person actually teaches on Finatix. */
  specialisms: string[];
  /** A lesson on this site taught by this person, so the claim is checkable. */
  sampleLesson?: {
    title: string;
    /** Internal route, e.g. "/lesson/<id>" or a course page. */
    href: string;
  };
}

export const INSTRUCTORS: Instructor[] = [];
