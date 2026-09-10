/**
 * Case study sitting windows.
 *
 * IMPORTANT: this list must only ever contain sittings that Finatix has
 * confirmed against CIMA's own published exam timetable AND that Finatix
 * actually supports with preparation content.
 *
 * It is intentionally EMPTY until the owner supplies verified dates. While it
 * is empty the case study journey asks for a level only and tells the visitor
 * honestly that specific sitting support is not yet listed. Nothing here is
 * guessed or generated.
 */

export interface Sitting {
  /** Stable id used in URLs and stored context, e.g. "2026-05". */
  id: string;
  /** Display label, e.g. "May 2026". */
  label: string;
  /** Levels this sitting is supported for. */
  levels: Array<"operational" | "management" | "strategic">;
  /** Optional note shown to the student (e.g. enrolment deadline). */
  note?: string;
}

export const VERIFIED_SITTINGS: Sitting[] = [];

export const hasVerifiedSittings = () => VERIFIED_SITTINGS.length > 0;

export const sittingsForLevel = (level?: string) =>
  VERIFIED_SITTINGS.filter((s) => !level || s.levels.includes(level as Sitting["levels"][number]));
