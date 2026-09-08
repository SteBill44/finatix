export interface Faq {
  question: string;
  answer: string;
}

/**
 * Shared FAQ content. Answers must describe functionality that actually exists.
 */
export const HOMEPAGE_FAQS: Faq[] = [
  {
    question: "Is Finatix suitable for beginners?",
    answer:
      "Yes. You can start at Certificate level with no prior accounting knowledge, and the platform works out what you already know as you answer questions.",
  },
  {
    question: "What CIMA exams does Finatix cover?",
    answer:
      "Finatix is built to cover the full CIMA pathway - Certificate level (BA1 to BA4), Operational (E1, P1, F1 and the Operational Case Study), Management (E2, P2, F2 and the Management Case Study) and Strategic (E3, P3, F3 and the Strategic Case Study). Each course page shows whether it is available now or coming soon.",
  },
  {
    question: "Is there a free version?",
    answer:
      "Yes. You can create a free account with no card details and start studying the free content straight away, including practice questions and your progress dashboard.",
  },
  {
    question: "How much does Finatix cost?",
    answer:
      "Finatix Pro is 49 pounds a month and includes every available course and feature. There is also a 999 pound lifetime option, and individual courses can be bought outright. All prices shown include VAT.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel at any time from your account settings. You keep access until the end of the period you have already paid for.",
  },
  {
    question: "Are mock exams included?",
    answer:
      "Yes. Timed mock exams are included with your course, alongside adaptive practice questions and topic quizzes.",
  },
  {
    question: "How does the AI study assistant work?",
    answer:
      "It sits inside your course and can explain a concept in simpler terms, explain why an answer you gave was wrong, and help you revise a topic. It uses your course content and your own performance as context.",
  },
  {
    question: "How does Finatix identify weak areas?",
    answer:
      "Every question is tagged to a syllabus area. As you answer, Finatix builds a mastery score per area, which drives your exam readiness percentage and the study it recommends next.",
  },
  {
    question: "Can I study on mobile?",
    answer:
      "Yes. Lessons, practice questions, mock exams, the AI assistant and your dashboard all work on a phone or tablet.",
  },
  {
    question: "Does Finatix replace traditional tuition?",
    answer:
      "It can be used on its own or alongside a tuition provider. Finatix focuses on personalised practice, revision and exam readiness rather than classroom teaching.",
  },
];
