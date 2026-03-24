import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const FAQ = () => {
  const faqs = [
    {
      question: "How long do I have to complete my training course?",
      answer: "You will have lifetime access to your course. You can work through your course at a pace that suits you. Once you have completed your course you will retain your access and be able to jump back in any time you want to refresh your memory."
    },
    {
      question: "When will my training course start?",
      answer: "Our courses are delivered on-demand. This means you can start and stop learning whenever you like. There is no time limit and no restriction on how many times you can access course content."
    },
    {
      question: "Does my course purchase include a CIMA exam voucher?",
      answer: "No. CIMA exam vouchers need to be purchased separately through CIMA. You can find further information about this on our CIMA Accreditation page."
    },
    {
      question: "Can I add my certification to my resume?",
      answer: "Absolutely! Demonstrating your dedication to professional development in management accounting is always a great idea. Our certifications are already recognised by leading professionals who value our training and certifications."
    },
    {
      question: "Can I buy training courses for people in my company?",
      answer: "Yes! You can create an account for an individual and purchase a course for them through our online payment portal for instant access. Alternatively, for multiple employees please get in contact with us using our contact form."
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground">
              Before you move on, take a look at our FAQs in case we have already answered any question you may have.
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
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
