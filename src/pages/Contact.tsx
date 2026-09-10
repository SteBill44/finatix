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
      answer: "Lessons written to the CIMA syllabus areas for each paper, automatically marked practice questions with explanations, timed mock exams, competency and weak-area tracking, flashcards, discussions, and a Finatix certificate of completion. Finatix is an independent study provider; CIMA registration, subscription and exam fees are paid directly to AICPA & CIMA."
    },
    {
      question: "Do you offer refunds?",
      answer: POLICY.refundText
    },
    {
      question: "Can I pause my subscription?",
      answer: "Yes, you can pause your subscription for up to 3 months. Your progress and data will be saved, and you can resume whenever you're ready to continue studying."
    },
    {
      question: "How do the tutor sessions work?",
      answer: "Tutor sessions are one-on-one video calls with our CIMA-qualified instructors. You can book sessions through the dashboard, and they're typically 45 minutes long. Use them for difficult topics or exam preparation."
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
      {/* Hero */}
      <section className="relative pt-32 lg:pt-36 pb-16 lg:pb-20 hero-gradient-light overflow-hidden">
        <div className="gradient-orb gradient-orb-primary w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] -top-20 -left-10 pointer-events-none" />
        <div className="gradient-orb gradient-orb-accent w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] top-1/3 -right-20 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 uppercase">
            Contact <span className="text-gradient-brand">Finatix</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Have a question about our courses or need support? We respond within 24 - 48 hours, Monday to Friday, 9am to 5pm.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3 max-w-3xl rounded-lg border border-border bg-card/80 p-6 shadow-lg backdrop-blur-sm">
            {[
              { value: "24 - 48h", label: "Response time" },
              { value: "Mon - Fri", label: "9am - 5pm" },
              { value: "GMT", label: "Support hours" },
            ].map((item) => (
              <div key={item.label} className="border-l-2 border-primary pl-5">
                <p className="text-2xl font-bold leading-none text-foreground md:text-3xl">
                  {item.value}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-8 lg:py-10 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find quick answers to common questions about our platform
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-card rounded-xl border border-border px-6"
                >
                  <AccordionTrigger className="hover:no-underline py-5 text-left">
                    <span className="font-medium text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 lg:py-10">
        <div className="container mx-auto px-4 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <Input
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <Textarea
                    placeholder="Tell us more about your question..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
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

                <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                  <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-teal" />
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

      {/* Course Demo Section */}
      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Sneak Peek
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              See What a Finatix Course Looks Like
            </h2>
            <p className="text-lg text-muted-foreground">
              A quick look inside the learning experience before you join
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Video lesson mock */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-gradient-to-br from-primary/80 to-teal/70 flex items-center justify-center">
                <PlayCircle className="w-14 h-14 text-white/90" />
                <span className="absolute bottom-3 left-3 text-xs font-medium text-white/90 bg-black/30 rounded px-2 py-0.5">
                  Lesson 4 · Variance Analysis · 12:36
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Bite-sized video lessons</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Every topic is broken into short, focused videos with downloadable notes and worked examples.
                </p>
              </div>
            </div>

            {/* Quiz mock */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <CircleHelp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Exam-style practice</h3>
              </div>
              <p className="text-sm font-medium text-foreground mb-3">
                A company budgeted 10,000 units but produced 9,200. What is this called?
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-muted-foreground">
                  <span className="w-4 h-4 rounded-full border border-border" /> Sales variance
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/5 px-3 py-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Volume variance
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-muted-foreground">
                  <span className="w-4 h-4 rounded-full border border-border" /> Price variance
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Instant feedback with a full explanation for every answer.
              </p>
            </div>

            {/* Analytics mock */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Competency analytics</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Cost accounting", pct: 86 },
                  { label: "Budgeting", pct: 64 },
                  { label: "Financial reporting", pct: 42 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-foreground font-medium">{row.label}</span>
                      <span className="text-muted-foreground">{row.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Your dashboard highlights weak areas so you know exactly what to revise next.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg">
              <a href="/courses">Browse the Courses</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
