import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/** Shared with the homepage FAQ schema so page and structured data always match. */
export const HOME_FAQS = [
  { question: "Which level should I start at?", answer: "Most people new to accounting start at Certificate level (BA1 to BA4). If you hold a relevant degree or qualification, CIMA may grant exemptions so you can start at Operational level or above. CIMA confirms exemptions, not Finatix." },
  { question: "Which CIMA levels does Finatix cover?", answer: "All of them: Certificate, Operational, Management and Strategic, plus the Operational, Management and Strategic case studies." },
  { question: "What's free and what's paid?", answer: "The four Certificate in Business Accounting courses are free with an account. Operational, Management, Strategic and case study courses are paid, and each course page shows its price and how to access it." },
  { question: "How do I get started?", answer: "Choose your level, open a course and create a free account. Your completed lessons and quiz results are saved to your account, so you can pick up where you left off." },
  { question: "Does a Finatix course include CIMA exam fees?", answer: "No. Finatix prices cover Finatix study material only. CIMA registration, the annual student subscription and exam fees are set and charged by AICPA & CIMA." },
  { question: "Is Finatix accredited by CIMA?", answer: "No. Finatix is an independent study provider, not accredited by, approved by, affiliated with or endorsed by CIMA or AICPA & CIMA. CIMA alone sets the exams and awards the qualification." },
];

const FAQ = () => (
  <section aria-labelledby="faq-heading" className="bg-background py-20 lg:py-28">
    <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Questions</p>
        <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Frequently asked questions</h2>
        <p className="mt-4 text-lg text-muted-foreground">Practical answers about levels, availability and getting started.</p>
      </div>
      <Accordion type="single" collapsible className="border-t border-border">
        {HOME_FAQS.map((faq, i) => (
          <AccordionItem key={faq.question} value={`item-${i}`} className="border-b border-border">
            <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:no-underline">{faq.question}</AccordionTrigger>
            <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQ;
