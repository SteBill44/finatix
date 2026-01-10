import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is CIMA and why should I get CIMA qualified?",
      answer: "CIMA (Chartered Institute of Management Accountants) is the world's largest professional body of management accountants. Getting CIMA qualified opens doors to senior finance roles, with CGMA designation holders earning significantly more than non-qualified accountants. Our platform helps you pass all CIMA exams from Certificate level (BA1, BA2, BA3, BA4) through to Strategic level."
    },
    {
      question: "How does Finaptics help me pass CIMA exams?",
      answer: "Finaptics uses competency-based analytics to identify your weak areas in each CIMA syllabus. Our adaptive learning system creates personalized study plans, provides 5,000+ CIMA practice questions, realistic mock exams that mirror the actual CIMA exam format, and detailed performance tracking across all CIMA competencies."
    },
    {
      question: "Which CIMA courses do you offer?",
      answer: "We offer comprehensive courses for all CIMA qualification levels: Certificate in Business Accounting (BA1, BA2, BA3, BA4), Operational Level (E1, P1, F1 + OCS), Management Level (E2, P2, F2 + MCS), and Strategic Level (E3, P3, F3 + SCS). Each course includes video lessons, practice questions, and mock exams aligned with the latest CIMA syllabus."
    },
    {
      question: "How long do I have to complete my CIMA course?",
      answer: "You will have lifetime access to your CIMA course. You can work through your course at a pace that suits you, fitting study around work and other commitments. Once you have completed your course you will retain access to refresh your knowledge before your CIMA exam."
    },
    {
      question: "Does my course purchase include a CIMA exam voucher?",
      answer: "No. CIMA exam vouchers need to be purchased separately through CIMA directly. Our courses prepare you thoroughly for CIMA exams, but the exam registration and voucher purchase is handled by CIMA. You can find further information about exam booking on the official CIMA website."
    },
    {
      question: "How is Finaptics different from other CIMA course providers?",
      answer: "Unlike traditional CIMA course providers, Finaptics offers modern competency-based analytics that identify exactly where you need to improve. Our adaptive learning technology, intuitive mobile-first interface, unlimited mock exams, and competitive pricing set us apart from providers like Kaplan and BPP."
    },
    {
      question: "Can I study for CIMA on my phone?",
      answer: "Yes! Our CIMA study platform is fully responsive and optimized for mobile learning. You can watch CIMA video lessons, complete practice questions, and take mock exams on any device. Your progress syncs automatically across phone, tablet, and desktop."
    },
    {
      question: "What is the CGMA qualification?",
      answer: "CGMA (Chartered Global Management Accountant) is a globally recognized designation awarded when you complete all CIMA exams and gain the required work experience. Our courses prepare you for the entire CIMA qualification pathway leading to CGMA designation."
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header - CIMA optimized */}
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              CIMA FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              CIMA Course Questions Answered
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about our CIMA exam preparation courses and the path to becoming CGMA qualified.
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
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
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;