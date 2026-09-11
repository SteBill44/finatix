import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

const FAQ = () => {


  const faqs = [
    {
      question: "How long do I have to complete my training course?",
      answer:
        "You will have lifetime access to your course. You can work through your course at a pace that suits you. Once you have completed your course you will retain your access and be able to jump back in any time you want to refresh your memory.",
    },
    {
      question: "When will my training course start?",
      answer:
        "Our courses are delivered on-demand. This means you can start and stop learning whenever you like. There is no time limit and no restriction on how many times you can access course content.",
    },
    {
      question: "Does my course purchase include a CIMA exam voucher?",
      answer:
        "No. Your Finatix price covers Finatix study material only. CIMA registration, the annual student subscription and every exam fee are set and charged by AICPA & CIMA and paid directly to them. Current fees are listed on the AICPA & CIMA fees page.",
    },
    {
      question: "Is Finatix accredited by CIMA?",
      answer:
        "No. Finatix is an independent study provider. We are not accredited by, approved by, affiliated with or endorsed by CIMA or AICPA & CIMA. Our courses are written to the published CIMA syllabus areas, and CIMA remains the only body that sets the exams and awards the qualification.",
    },
    {
      question: "Can I put my Finatix certificate on my CV?",
      answer:
        "Yes, as evidence of the study you have completed. Be clear about what it is: a Finatix certificate of completion showing you finished a Finatix course and passed its final assessment. It is not a CIMA qualification, a CIMA exam result, CIMA membership or a professional designation, and it gives no exemption from any CIMA exam.",
    },
    {
      question: "Can I buy training courses for people in my company?",
      answer:
        "Yes! You can create an account for an individual and purchase a course for them through our online payment portal for instant access. Alternatively, for multiple employees please get in contact with us using our contact form.",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div ref={headerRef}>
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
