import { useState } from "react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  Send
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

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
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 - 48 hours, Monday to Friday, 9am to 5pm.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const faqs = [
    {
      question: "How do I access my courses after purchase?",
      answer: "Once you complete your purchase, you'll receive an email with login credentials. You can then access all your courses from the Student Dashboard. All content is available immediately."
    },
    {
      question: "Can I study on mobile devices?",
      answer: "Yes! Our platform is fully responsive and optimized for mobile learning. You can study on any device — phone, tablet, or computer. All your progress syncs automatically across devices."
    },
    {
      question: "What's included in the mock exams?",
      answer: "Our mock exams mirror the real CIMA exam format and difficulty. Each mock includes detailed explanations for every question, performance analytics, and identifies your weak areas for targeted revision."
    },
    {
      question: "How is Finatix different from Kaplan?",
      answer: "We offer modern competency-based analytics that identify your weak areas, adaptive learning paths, a more intuitive interface, and competitive pricing. Our platform is built for today's students who expect modern technology."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee on all plans. If you're not satisfied with your purchase, contact our support team within 30 days for a full refund, no questions asked."
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
          "@type": "LocalBusiness",
          name: "Finatix",
          url: "https://finatix.lovable.app/contact",
          email: "hello@finatix.com",
          telephone: "+44 20 1234 5678",
          address: {
            "@type": "PostalAddress",
            streetAddress: "123 Learning Street",
            addressLocality: "London",
            postalCode: "EC1A 1BB",
            addressCountry: "GB",
          },
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
                    <p className="text-muted-foreground">hello@finatix.com</p>
                    <p className="text-muted-foreground">support@finatix.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground">+44 (0) 20 1234 5678</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 9am-6pm GMT</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                  <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Office</h3>
                    <p className="text-muted-foreground">123 Learning Street</p>
                    <p className="text-muted-foreground">London, EC1A 1BB, UK</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Live Chat</h3>
                    <p className="text-muted-foreground">Chat with our support team</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
