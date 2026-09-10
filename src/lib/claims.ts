/**
 * Internal source and review record for externally verifiable claims.
 *
 * Rules for this file:
 * - Every number or comparative statement shown publicly must appear here with
 *   a named source, a URL and the date the source was last checked.
 * - If a claim cannot be evidenced, delete it from the site rather than
 *   softening it. Do not park an unverified number here "for now".
 * - Never state or imply accreditation, approval or partnership with CIMA /
 *   AICPA unless the owner supplies written evidence and it is recorded here.
 */

export interface ClaimSource {
  /** Short human label shown in the discreet "source" link. */
  label: string;
  url: string;
  /** ISO date the source text was last read and the claim checked against it. */
  checked: string;
}

export interface VerifiedClaim {
  /** The exact wording used on the site. */
  statement: string;
  /** Who or what the number describes, so it is never read more widely. */
  population: string;
  source: ClaimSource;
}

const AICPA_CIMA_CGMA_JOURNEY: ClaimSource = {
  label: "AICPA & CIMA",
  url: "https://www.aicpa-cima.com/resources/landing/cgma-designation",
  checked: "2026-09-10",
};

const AICPA_CIMA_PER: ClaimSource = {
  label: "AICPA & CIMA practical experience requirements",
  url: "https://www.aicpa-cima.com/resources/landing/practical-experience-requirements",
  checked: "2026-09-10",
};

const AICPA_CIMA_FEES: ClaimSource = {
  label: "AICPA & CIMA fees",
  url: "https://www.aicpa-cima.com/resources/landing/fees",
  checked: "2026-09-10",
};

const AICPA_CIMA_SALARY: ClaimSource = {
  label: "AICPA & CIMA Salary Insights",
  url: "https://salary.aicpa-cima.com/",
  checked: "2026-09-10",
};

const CIMA_UK_HUB: ClaimSource = {
  label: "AICPA & CIMA (CIMA UK)",
  url: "https://www.aicpa-cima.com/resources/landing/uk",
  checked: "2026-09-10",
};

/** Claims about CIMA that we are willing to publish, with their evidence. */
export const CIMA_CLAIMS = {
  community: {
    statement: "597,000 AICPA and CIMA members, candidates and registrants",
    population:
      "Combined AICPA and CIMA members, candidates and registrants worldwide - not CIMA members alone.",
    source: AICPA_CIMA_CGMA_JOURNEY,
  } satisfies VerifiedClaim,
  countries: {
    statement: "188 countries and territories",
    population:
      "Countries and territories where those AICPA and CIMA members, candidates and registrants are based.",
    source: AICPA_CIMA_CGMA_JOURNEY,
  } satisfies VerifiedClaim,
  bodySize: {
    statement:
      "CIMA describes itself as the world's largest professional body of management accountants",
    population: "CIMA's own description of itself, founded 1919, headquartered in London.",
    source: CIMA_UK_HUB,
  } satisfies VerifiedClaim,
  practicalExperience: {
    statement:
      "A minimum of three years' verified relevant practical experience is required for the CGMA designation",
    population: "Requirement set by AICPA & CIMA for CGMA designation holders.",
    source: AICPA_CIMA_PER,
  } satisfies VerifiedClaim,
  salary: {
    statement:
      "AICPA & CIMA publish salary data for CGMA designation holders and candidates",
    population:
      "Self-reported salary data collected by AICPA & CIMA. We publish no salary figure of our own.",
    source: AICPA_CIMA_SALARY,
  } satisfies VerifiedClaim,
  fees: {
    statement:
      "Registration, annual subscription and exam fees are set and charged by AICPA & CIMA",
    population: "Official fees payable directly to AICPA & CIMA, not to Finatix.",
    source: AICPA_CIMA_FEES,
  } satisfies VerifiedClaim,
} as const;

export const CIMA_SOURCES = {
  fees: AICPA_CIMA_FEES,
  per: AICPA_CIMA_PER,
  salary: AICPA_CIMA_SALARY,
  journey: AICPA_CIMA_CGMA_JOURNEY,
  ukHub: CIMA_UK_HUB,
} as const;

/**
 * Finatix's relationship with CIMA.
 *
 * The owner has not supplied evidence of any accreditation, approval,
 * partnership or tuition-provider status. Until written evidence exists and is
 * recorded here, the site must say plainly that Finatix is independent.
 */
export const CIMA_RELATIONSHIP = {
  isIndependent: true,
  /** Set only from owner-supplied written evidence. */
  accreditationEvidence: null as null | { description: string; source: ClaimSource },
  shortStatement:
    "Finatix is an independent study provider. We are not accredited by, approved by, affiliated with or endorsed by CIMA or AICPA & CIMA.",
} as const;

/** What a buyer gets from us, and what they must arrange themselves. */
export const RESPONSIBILITIES = {
  finatixProvides: [
    "Structured lessons written to the CIMA syllabus areas for each paper",
    "Practice quizzes and timed mock exams marked automatically",
    "Progress, competency and weak-area tracking",
    "A Finatix certificate of completion for each course you finish",
  ],
  studentArranges: [
    "Registration as a CIMA student with AICPA & CIMA",
    "The annual CIMA student subscription",
    "Booking and paying for each official CIMA exam",
    "Any exemptions, and the practical experience needed for CGMA membership",
  ],
  /** Stated plainly so nobody assumes exam fees are bundled. */
  feesNotIncluded:
    "Finatix course prices cover Finatix study material only. CIMA registration, subscription and exam fees are separate and are paid directly to AICPA & CIMA.",
  feesSource: AICPA_CIMA_FEES,
} as const;

/** What a Finatix certificate is, and what it is not. */
export const CERTIFICATE_MEANING = {
  title: "Finatix certificate of completion",
  is: "It records that you finished a Finatix course and passed its final assessment on our platform.",
  isNot:
    "It is not a CIMA qualification, a CIMA exam result, CIMA membership or a professional designation, and it carries no exemption from any CIMA exam.",
} as const;

/**
 * Outstanding factual decisions for the owner. Keep this list honest - it is
 * the checklist for what still cannot be evidenced.
 */
export const OPEN_CLAIM_DECISIONS = [
  "Confirm in writing whether Finatix holds any formal status with AICPA & CIMA (for example a tuition provider listing). Until then the site says we are independent.",
  "Supply the registered company name, number and trading address so the business identity block can be completed.",
  "If a salary figure is wanted, choose one dated published survey and confirm the population it describes.",
  "If competitor comparisons are wanted, supply dated evidence for a named comparable product from that competitor's own current pricing or course pages.",
] as const;
