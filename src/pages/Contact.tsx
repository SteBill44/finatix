import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  Send,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

type FormErrors = Partial<Record<keyof z.infer<typeof contactSchema> | 'humanCheck', string>>;

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isHuman, setIsHuman] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: keyof typeof formData, value: string) => {
    try {
      contactSchema.shape[field].parse(value);
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
      }
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof typeof formData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      setTouched({ name: true, email: true, subject: true, message: true });
      return;
    }

    if (!isHuman) {
      setErrors(prev => ({ ...prev, humanCheck: "Please confirm you are human" }));
      return;
    }

    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setIsHuman(false);
    setTouched({});
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
      question: "How is Finaptics different from Kaplan?",
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
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden hero-gradient-light">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="gradient-orb gradient-orb-primary w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] -top-20 -right-20 pointer-events-none" />
        <div className="gradient-orb gradient-orb-accent w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] top-1/4 -left-20 pointer-events-none" />
        <div className="gradient-orb gradient-orb-primary w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] bottom-0 right-1/4 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            We're Here to Help
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Have a question about our courses or need support? Our team is ready to assist you.
          </p>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 40 720 60 0 20L0 60Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
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
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className={errors.name && touched.name ? "border-destructive" : ""}
                    />
                    {errors.name && touched.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={errors.email && touched.email ? "border-destructive" : ""}
                    />
                    {errors.email && touched.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <Input
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    onBlur={() => handleBlur('subject')}
                    className={errors.subject && touched.subject ? "border-destructive" : ""}
                  />
                  {errors.subject && touched.subject && (
                    <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <Textarea
                    placeholder="Tell us more about your question..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    className={errors.message && touched.message ? "border-destructive" : ""}
                  />
                  {errors.message && touched.message && (
                    <p className="text-sm text-destructive mt-1">{errors.message}</p>
                  )}
                </div>
                
                {/* Human verification checkbox */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="humanCheck"
                    checked={isHuman}
                    onCheckedChange={(checked) => {
                      setIsHuman(checked === true);
                      if (checked) {
                        setErrors(prev => ({ ...prev, humanCheck: undefined }));
                      }
                    }}
                    className={errors.humanCheck ? "border-destructive" : ""}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="humanCheck"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I am a human
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Please confirm you're not a robot
                    </p>
                    {errors.humanCheck && (
                      <p className="text-sm text-destructive">{errors.humanCheck}</p>
                    )}
                  </div>
                </div>
                
                <Button type="submit" size="lg" className="gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-card rounded-2xl border border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">hello@finaptics.com</p>
                    <p className="text-muted-foreground">support@finaptics.com</p>
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