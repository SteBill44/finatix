import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Users, BarChart3, Award, CheckCircle, 
  ArrowRight, Phone, Mail, Briefcase 
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmitCorporateInquiry } from "@/hooks/useCorporate";
import { toast } from "sonner";

const ForEmployers = () => {
  const submitInquiry = useSubmitCorporateInquiry();
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    phone: "",
    employee_count: "",
    notes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name || !formData.contact_email) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await submitInquiry.mutateAsync({
        company_name: formData.company_name,
        contact_email: formData.contact_email,
        contact_name: formData.contact_name || undefined,
        phone: formData.phone || undefined,
        employee_count: formData.employee_count ? parseInt(formData.employee_count) : undefined,
        notes: formData.notes || undefined,
      });
      setIsSubmitted(true);
      toast.success("Thank you! We'll be in touch soon.");
    } catch {
      toast.error("Failed to submit inquiry. Please try again.");
    }
  };

  const benefits = [
    {
      icon: BarChart3,
      title: "Track Team Progress",
      description: "Real-time dashboard showing employee progress, quiz scores, and completion rates.",
    },
    {
      icon: Award,
      title: "Verified Certificates",
      description: "Digital certificates for completed courses that employees can share on LinkedIn.",
    },
    {
      icon: Users,
      title: "Bulk Enrollment",
      description: "Easily enroll multiple employees at once with volume discounts.",
    },
    {
      icon: Building2,
      title: "Dedicated Support",
      description: "Priority support and dedicated account manager for your organization.",
    },
  ];

  const pricingTiers = [
    {
      name: "Team",
      employees: "5-10",
      discount: "15%",
      features: ["All course access", "Progress tracking", "Email support"],
    },
    {
      name: "Business",
      employees: "11-50",
      discount: "25%",
      features: ["All Team features", "Admin dashboard", "Priority support", "Custom reporting"],
      popular: true,
    },
    {
      name: "Enterprise",
      employees: "50+",
      discount: "Custom",
      features: ["All Business features", "Dedicated account manager", "Custom integrations", "On-site training"],
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Briefcase className="h-4 w-4" />
                Corporate Training Solutions
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Upskill Your Finance Team with CIMA Training
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Give your employees access to world-class CIMA courses at discounted rates. 
                Track progress, measure ROI, and develop your finance talent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="#contact">
                    Get a Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Schedule a Call
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Partner with Finaptics?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make corporate CIMA training simple, trackable, and cost-effective.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Volume Discounts</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The more employees you enroll, the more you save. All plans include full course access.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full ${tier.popular ? "ring-2 ring-primary" : ""}`}>
                  {tier.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <p className="text-muted-foreground">{tier.employees} employees</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-primary">{tier.discount}</span>
                      <span className="text-muted-foreground ml-2">discount</span>
                    </div>
                    <ul className="space-y-2">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground">
                Tell us about your training needs and we'll create a custom proposal.
              </p>
            </div>
            
            {isSubmitted ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                  <p className="text-muted-foreground">
                    We've received your inquiry and will get back to you within 1-2 business days.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name *</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="Acme Corporation"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_name">Your Name</Label>
                        <Input
                          id="contact_name"
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          placeholder="John Smith"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Work Email *</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                          placeholder="john@acme.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+44 20 1234 5678"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Number of Employees to Enroll</Label>
                      <Select 
                        value={formData.employee_count} 
                        onValueChange={(value) => setFormData({ ...formData, employee_count: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5-10 employees</SelectItem>
                          <SelectItem value="15">11-25 employees</SelectItem>
                          <SelectItem value="35">26-50 employees</SelectItem>
                          <SelectItem value="75">51-100 employees</SelectItem>
                          <SelectItem value="150">100+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Information</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Tell us about your training goals, specific courses you're interested in, or any questions..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={submitInquiry.isPending}
                    >
                      {submitInquiry.isPending ? "Submitting..." : "Submit Inquiry"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Direct Contact */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">Or reach us directly:</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:corporate@finaptics.com" 
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  corporate@finaptics.com
                </a>
                <a 
                  href="tel:+442012345678" 
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  +44 20 1234 5678
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ForEmployers;
