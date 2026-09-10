/**
 * The real CIMA papers Finatix publishes, keyed by the course slug that
 * already exists in the database. Nothing is listed here that isn't a real
 * course - the paper landing page loads its outcomes and sample content live
 * from the course record, so there are no duplicated per-paper pages.
 */

export type CimaLevel = "certificate" | "operational" | "management" | "strategic";

export interface Paper {
  /** Paper code as CIMA writes it, e.g. "P1", "OCS". */
  code: string;
  /** URL segment used by /papers/:code (lowercased code). */
  slugCode: string;
  /** Course slug in the database. */
  courseSlug: string;
  level: CimaLevel;
  /** Objective test papers vs case study. */
  kind: "objective-test" | "case-study";
  /** Short, factual description of what the paper covers. */
  focus: string;
}

export const PAPERS: Paper[] = [
  { code: "BA1", slugCode: "ba1", courseSlug: "ba1-business-economics", level: "certificate", kind: "objective-test", focus: "Economics for business, markets, the financial system and macroeconomic context." },
  { code: "BA2", slugCode: "ba2", courseSlug: "ba2-management-accounting", level: "certificate", kind: "objective-test", focus: "Costing, budgeting and short-term decision making." },
  { code: "BA3", slugCode: "ba3", courseSlug: "ba3-financial-accounting", level: "certificate", kind: "objective-test", focus: "Double entry, financial statements and basic control accounts." },
  { code: "BA4", slugCode: "ba4", courseSlug: "ba4-ethics-governance-law", level: "certificate", kind: "objective-test", focus: "Ethics, corporate governance and business law." },

  { code: "E1", slugCode: "e1", courseSlug: "e1-managing-finance", level: "operational", kind: "objective-test", focus: "Managing the finance function in a digital world." },
  { code: "P1", slugCode: "p1", courseSlug: "p1-management-accounting", level: "operational", kind: "objective-test", focus: "Costing, budgeting and short-run decisions with risk." },
  { code: "F1", slugCode: "f1", courseSlug: "f1-financial-reporting", level: "operational", kind: "objective-test", focus: "Financial reporting, tax and managing cash." },
  { code: "OCS", slugCode: "ocs", courseSlug: "ocs-operational-case-study", level: "operational", kind: "case-study", focus: "Applying E1, P1 and F1 to a finance officer role in one integrated case." },

  { code: "E2", slugCode: "e2", courseSlug: "e2-managing-performance", level: "management", kind: "objective-test", focus: "Managing projects, relationships and performance." },
  { code: "P2", slugCode: "p2", courseSlug: "p2-advanced-management-accounting", level: "management", kind: "objective-test", focus: "Advanced costing, capital investment and control." },
  { code: "F2", slugCode: "f2", courseSlug: "f2-advanced-financial-reporting", level: "management", kind: "objective-test", focus: "Group accounts, complex reporting and analysis." },
  { code: "MCS", slugCode: "mcs", courseSlug: "mcs-management-case-study", level: "management", kind: "case-study", focus: "Applying E2, P2 and F2 to a finance manager role in one integrated case." },

  { code: "E3", slugCode: "e3", courseSlug: "e3-strategic-management", level: "strategic", kind: "objective-test", focus: "Strategy formulation, change and digital strategy." },
  { code: "P3", slugCode: "p3", courseSlug: "p3-risk-management", level: "strategic", kind: "objective-test", focus: "Risk, internal control and cyber risk." },
  { code: "F3", slugCode: "f3", courseSlug: "f3-financial-strategy", level: "strategic", kind: "objective-test", focus: "Financial strategy, valuation and funding." },
  { code: "SCS", slugCode: "scs", courseSlug: "scs-strategic-case-study", level: "strategic", kind: "case-study", focus: "Applying E3, P3 and F3 to a senior finance role in one integrated case." },
];

export const LEVEL_LABELS: Record<CimaLevel, string> = {
  certificate: "Certificate level",
  operational: "Operational level",
  management: "Management level",
  strategic: "Strategic level",
};

export const LEVEL_ORDER: CimaLevel[] = [
  "certificate",
  "operational",
  "management",
  "strategic",
];

export const paperBySlugCode = (slugCode?: string) =>
  PAPERS.find((p) => p.slugCode === slugCode?.toLowerCase());

export const paperByCourseSlug = (courseSlug?: string) =>
  PAPERS.find((p) => p.courseSlug === courseSlug);

export const papersByLevel = (level: CimaLevel) =>
  PAPERS.filter((p) => p.level === level);

export const caseStudyPapers = () => PAPERS.filter((p) => p.kind === "case-study");

/** The free Certificate-level sample everyone can open without paying. */
export const FREE_SAMPLE_COURSE_SLUG = "ba1-business-economics";
