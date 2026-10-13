/** The four CIMA levels as shown on general brand pages. Facts about the CIMA structure only, no Finatix claims. */
export const CIMA_LEVELS = [
  {
    id: "certificate",
    name: "Certificate",
    full: "Certificate in Business Accounting",
    who: "For newcomers to accounting, or anyone without a relevant degree who needs a starting point.",
    subjects: ["BA1", "BA2", "BA3", "BA4"],
    caseStudy: null,
    award: "CIMA Certificate in Business Accounting",
  },
  {
    id: "operational",
    name: "Operational",
    full: "Operational level",
    who: "For students building the core of management accounting, financial reporting and digital finance.",
    subjects: ["E1", "P1", "F1"],
    caseStudy: { code: "OCS", slug: "ocs-operational-case-study" },
    award: "CIMA Diploma in Management Accounting",
  },
  {
    id: "management",
    name: "Management",
    full: "Management level",
    who: "For those moving into performance management, advanced reporting and project-based decisions.",
    subjects: ["E2", "P2", "F2"],
    caseStudy: { code: "MCS", slug: "mcs-management-case-study" },
    award: "CIMA Advanced Diploma in Management Accounting",
  },
  {
    id: "strategic",
    name: "Strategic",
    full: "Strategic level",
    who: "For the final stretch: strategy, risk and financial strategy, ahead of the CGMA designation.",
    subjects: ["E3", "P3", "F3"],
    caseStudy: { code: "SCS", slug: "scs-strategic-case-study" },
    award: "Towards the CGMA designation",
  },
] as const;

export type CimaLevelId = (typeof CIMA_LEVELS)[number]["id"];
