import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import SplitTextReveal from "./SplitTextReveal";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { HOMEPAGE_FAQS } from "@/content/faqs";

const FAQ = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true, amount: 0.3 });

  return (
    <section className="py-12 lg:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
            <SplitTextReveal
              as="h2"
              className="text-3xl md:text-4xl font-bold text-charcoal mb-4"
            >
              Frequently asked questions
            </SplitTextReveal>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-muted-foreground"
            >
              Everything students usually ask before creating an account.
            </motion.p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {HOMEPAGE_FAQS.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-background rounded-lg border border-border px-6"
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
