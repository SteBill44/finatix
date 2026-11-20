import { useState } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Clock,
  Send,
  PlayCircle,
  CheckCircle2,
  BarChart3,
  BookOpen,
  CircleHelp,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { COMPANY, mailto } from "@/lib/company";
import BusinessIdentity from "@/components/credibility/BusinessIdentity";
import { POLICY } from "@/lib/catalogue";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Opens the visitor's own email app with the message ready to send, so a
    // message is never silently lost and we never claim it was delivered.
    window.location.href = mailto(
      COMPANY.contactEmail,
      formData.subject,
      `${formData.message}\n\n---\nFrom: ${formData.name} (${formData.email})`
    );
    toast({
      title: "Your email app is opening",
      description: `Press send there and we'll reply ${COMPANY.responseTime.toLowerCase()}.`,
    });
  };

  const faqs = [
    {
      question: "How do I access my courses after purchase?",
      answer: "Once you complete your purchase, you'll receive an email with login credentials. You can then access all your courses from the Student Dashboard. All content is available immediately."
    },
    {
      question: "Can I study on mobile devices?",
      answer: "Yes! Our platform is fully responsive and optimized for mobile learning. You can study on any device - phone, tablet, or computer. All your progress syncs automatically across devices."
    },
    {
      question: "What's included in the mock exams?",
      answer: "Mock exams are Finatix-written papers sat under timed conditions in the exam-style format. They are not past CIMA papers and are not set or approved by CIMA. Each mock includes an explanation for every question, performance analytics and weak-area identification."
    },
    {
      question: "What do I get with Finatix?",
      answer: "Finatix brings syllabus-organised lessons, practice and saved progress together in one account. Each exam page lists its resources and access options. CIMA registration, subscription and exam fees are paid separately to AICPA & CIMA."
    },
    {
      question: "Do you offer refunds?",
      answer: POLICY.refundText
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption and security practices to protect your data. We're GDPR compliant and never share your information with third parties."
    },
  ];

  return (
    <Layout>
      <SEOHead 
        title="Contact Us"
        description="Get in touch with the Finatix team for help with your CIMA training, technical support or course inquiries."
        keywords="contact Finatix, CIMA support, help, customer service"
        canonicalUrl="/contact"
      />
      <JsonLd
        id="local-business-jsonld"
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: COMPANY.name,
          url: COMPANY.website,
          email: COMPANY.contactEmail,
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: COMPANY.supportEmail,
              availableLanguage: "English",
            },
          ],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "17:00",
            },
          ],
        }}
      />
      <section className="public-hero"><div className="container px-5 md:px-8"><p className="eyebrow">Contact Finatix</p><h1 className="public-title">Let's get you<br /><span className="text-primary">moving forward.</span></h1><p className="mt-5 max-w-xl text-lg text-muted-foreground">Questions about an exam, your account or course access? We're here to help.</p><p className="mt-3 text-sm text-muted-foreground">{COMPANY.responseTime} · {COMPANY.supportHours}</p></div></section>

      {/* Contact Section */}
      <section className="section-space">
        <div className="container mx-auto px-5 md:px-8 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-2">Name</label>
                    <Input
                      id="contact-name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <Input
                    id="contact-subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us more about your question..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button trace type="submit" size="lg" className="gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-card rounded-md border border-border">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">
                      General enquiries:{" "}
                      <a href={`mailto:${COMPANY.contactEmail}`} className="text-primary hover:underline">
                        {COMPANY.contactEmail}
                      </a>
                    </p>
                    <p className="text-muted-foreground">
                      Account and course help:{" "}
                      <a href={`mailto:${COMPANY.supportEmail}`} className="text-primary hover:underline">
                        {COMPANY.supportEmail}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-md border border-border">
                  <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">When we're around</h3>
                    <p className="text-muted-foreground">{COMPANY.supportHours}</p>
                    <p className="text-muted-foreground">{COMPANY.responseTime}</p>
                  </div>
                </div>

                <BusinessIdentity compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space border-t border-border bg-secondary/30"><div className="container grid gap-10 px-5 md:px-8 lg:grid-cols-[1fr_1.2fr]"><h2 className="section-title">A quick answer<br />might be here.</h2><Accordion type="single" collapsible className="border-t border-border">{faqs.map((faq, i) => <AccordionItem key={faq.question} value={`faq-${i}`}><AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger><AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>
    </Layout>
  );
};

export default Contact;
