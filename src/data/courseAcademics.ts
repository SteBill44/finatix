/**
 * Academic provenance and approved teaching samples for each course.
 *
 * RULES
 * - Everything in here must be supplied and approved by the owner or the
 *   named academic author. Nothing may be generated, guessed or padded.
 * - Every field is optional. When a field is missing the course page simply
 *   hides it publicly, and an admin-only checklist shows what is outstanding.
 * - Do not claim CIMA approval or "syllabus aligned" anywhere. State only the
 *   syllabus version the material was written against, and who reviewed it.
 *
 * The record below is intentionally EMPTY until verified content arrives.
 */

export interface AcademicPerson {
  name: string;
  /** e.g. "ACMA, CGMA" or "FCCA". Only what the person can evidence. */
  credentials?: string;
  /** Optional one-line background. */
  bio?: string;
}

export interface WorkedQuestion {
  /** The question exactly as reviewed. */
  question: string;
  /** Assumptions the student is expected to make or is given. */
  assumptions?: string[];
  /** Step-by-step reasoning, in the order a marker would expect it. */
  reasoning: string[];
  /** The model answer. */
  answer: string;
  /** Mistakes real students make on this question type. */
  commonMistakes: string[];
  /** How to read the result - what it tells a manager. */
  interpretation: string;
  /** Who checked it and when. Required before it can be shown. */
  approvedBy: string;
  /** ISO date, e.g. "2026-03-14". */
  approvedOn: string;
}

export interface MarkedResponse {
  /** Short, anonymised description of the case scenario. */
  scenarioSummary: string;
  /** The anonymised student response, published with permission. */
  studentResponse: string;
  /** Our marker's commentary. Never invented examiner feedback. */
  markerCommentary: string;
  /** Optional mark breakdown as agreed with the marker. */
  marks?: Array<{ area: string; comment: string }>;
  approvedBy: string;
  approvedOn: string;
  /** Confirmation that the student agreed to publication. */
  permissionOnFile: boolean;
}

export interface CourseAcademics {
  /** Syllabus edition the material was written against, e.g. "2019 syllabus". */
  syllabusVersion?: string;
  /** Exam window or sitting the material is prepared for, where relevant. */
  examPeriod?: string;
  /** ISO date of the last academic review. */
  lastReviewed?: string;
  author?: AcademicPerson;
  reviewer?: AcademicPerson;
  /** Learning outcomes in the author's words. */
  learningOutcomes?: string[];
  /** Lesson id that may be opened by anyone as a genuine sample. */
  sampleLessonId?: string;
  workedQuestion?: WorkedQuestion;
  /** Case study courses only. */
  markedResponse?: MarkedResponse;
  /** Case study courses only: how application, judgement and communication are marked. */
  assessmentExplanation?: string;
}

/** Owner-supplied academic data, keyed by course slug. Empty by design. */
export const COURSE_ACADEMICS: Record<string, CourseAcademics> = {};

export const getCourseAcademics = (slug?: string | null): CourseAcademics =>
  (slug && COURSE_ACADEMICS[slug]) || {};

export interface MissingAcademicField {
  key: keyof CourseAcademics;
  label: string;
}

const BASE_FIELDS: MissingAcademicField[] = [
  { key: "syllabusVersion", label: "Syllabus version the material was written against" },
  { key: "lastReviewed", label: "Date of the last academic review" },
  { key: "author", label: "Named author with credentials" },
  { key: "reviewer", label: "Named reviewer with credentials" },
  { key: "learningOutcomes", label: "Learning outcomes in the author's words" },
  { key: "sampleLessonId", label: "A lesson approved for free public preview" },
  { key: "workedQuestion", label: "One vetted worked question with reasoning and interpretation" },
];

const CASE_STUDY_FIELDS: MissingAcademicField[] = [
  { key: "examPeriod", label: "Exam sitting this preparation covers" },
  { key: "markedResponse", label: "Anonymised marked response (with permission on file)" },
  { key: "assessmentExplanation", label: "How application, judgement and communication are assessed" },
];

/** What the owner still needs to supply for this course. */
export function missingAcademicFields(
  slug: string | undefined,
  isCaseStudy: boolean
): MissingAcademicField[] {
  const data = getCourseAcademics(slug);
  const fields = isCaseStudy ? [...BASE_FIELDS, ...CASE_STUDY_FIELDS] : BASE_FIELDS;
  return fields.filter((f) => {
    const value = data[f.key];
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === "";
  });
}
