import { PAPERS, LEVEL_ORDER, LEVEL_LABELS, type CimaLevel, type Paper } from "@/lib/papers";

const EXAM_NAMES: Record<string, string> = {
  BA1: "Business Economics", BA2: "Management Accounting", BA3: "Financial Accounting", BA4: "Ethics, Governance & Business Law",
  E1: "Managing Finance in a Digital World", P1: "Management Accounting", F1: "Financial Reporting", OCS: "Operational Case Study",
  E2: "Managing Performance", P2: "Advanced Management Accounting", F2: "Advanced Financial Reporting", MCS: "Management Case Study",
  E3: "Strategic Management", P3: "Risk Management", F3: "Financial Strategy", SCS: "Strategic Case Study",
};
export const examName = (paper: Paper) => EXAM_NAMES[paper.code] ?? paper.code;
export const EXAM_GROUPS = LEVEL_ORDER.map((level: CimaLevel) => ({
  level, label: LEVEL_LABELS[level].replace(" level", ""), exams: PAPERS.filter((paper) => paper.level === level),
}));
