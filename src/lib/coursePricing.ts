/**
 * Maps a course slug to its payment price ID.
 * Courses without an entry here are free to join (no payment required).
 */
export const COURSE_PRICE_IDS: Record<string, string> = {
  "e1-managing-finance": "course_e1_managing_finance_onetime",
  "f1-financial-reporting": "course_f1_financial_reporting_onetime",
  "p1-management-accounting": "course_p1_management_accounting_onetime",
  "ocs-operational-case-study": "course_ocs_operational_case_study_onetime",
  "e2-managing-performance": "course_e2_managing_performance_onetime",
  "f2-advanced-financial-reporting": "course_f2_advanced_financial_reporting_onetime",
  "p2-advanced-management-accounting": "course_p2_advanced_management_accounting_onetime",
  "mcs-management-case-study": "course_mcs_management_case_study_onetime",
  "e3-strategic-management": "course_e3_strategic_management_onetime",
  "f3-financial-strategy": "course_f3_financial_strategy_onetime",
  "p3-risk-management": "course_p3_risk_management_onetime",
  "scs-strategic-case-study": "course_scs_strategic_case_study_onetime",
};

export function getCoursePriceId(slug?: string | null): string | undefined {
  if (!slug) return undefined;
  return COURSE_PRICE_IDS[slug];
}
