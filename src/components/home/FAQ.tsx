import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

/** Shared with the homepage FAQ schema so page and structured data always match. */
export const HOME_FAQS = [
  { question: "What can I use for free today?", answer: "The four Certificate courses (BA1-BA4) are free with an account. BA1 and BA2 each have about 190 exam-style questions in short lesson quizzes, every one with a worked explanation. BA3 and BA4 currently show their lesson outlines, with practice still being written." },
  { question: "When will the paid courses open?", answer: "Operational, Management, Strategic and case study courses are still being written and reviewed, so they aren't on sale yet. You can register interest on any course page and we'll email you when it opens. Nothing is charged until then." },
  { question: "Does my course purchase include a CIMA exam voucher?", answer: "No. Your Finatix price covers Finatix study material only. CIMA registration, the annual student subscription and every exam fee are set and charged by AICPA & CIMA and paid directly to them. Current fees are listed on the AICPA & CIMA fees page." },
  { question: "Is Finatix accredited by CIMA?", answer: "No. Finatix is an independent study provider. We are not accredited by, approved by, affiliated with or endorsed by CIMA or AICPA & CIMA. Our courses are written to the published CIMA syllabus areas, and CIMA remains the only body that sets the exams and awards the qualification." },
  { question: "Is a Finatix certificate a CIMA qualification?", answer: "No. A Finatix certificate of completion shows you finished a Finatix course and passed its final assessment. It is not a CIMA qualification, exam result, membership or professional designation, and it gives no exemption from any CIMA exam." },
  { question: "Can I arrange study for people in my company?", answer: "Your team can start on the free Certificate courses today. For paid courses or several employees, contact us through the contact form and we'll explain what's available." },
];

const FAQ = () => {


  const faqs = HOME_FAQS;

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div>
            <SectionHeading
              eyebrow="Questions"
              title="Frequently asked questions"
              description="Before you move on, take a look at our FAQs in case we have already answered any question you may have."
            />
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card rounded-2xl border border-border px-6 transition-colors hover:border-primary/40"
                >
                  <AccordionTrigger className="text-left text-charcoal hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
