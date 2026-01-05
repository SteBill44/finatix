import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, BookOpen, MessageCircle, Mail, FileText, Video, HelpCircle, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of using Finaptics",
      articles: 8,
    },
    {
      icon: Video,
      title: "Course Access",
      description: "How to enroll and access your courses",
      articles: 12,
    },
    {
      icon: FileText,
      title: "Quizzes & Exams",
      description: "Taking quizzes, mock exams, and tracking progress",
      articles: 10,
    },
    {
      icon: HelpCircle,
      title: "Account & Billing",
      description: "Manage your account and payment settings",
      articles: 6,
    },
  ];

  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer: "To enroll in a course, navigate to the Courses page, select the course you're interested in, and click the 'Enroll Now' button. If it's a paid course, you'll be guided through the payment process. Once enrolled, the course will appear in your Dashboard.",
    },
    {
      question: "Can I access courses on mobile devices?",
      answer: "Yes! Finaptics is fully responsive and works on all devices including smartphones and tablets. You can access your courses, take quizzes, and track your progress from anywhere.",
    },
    {
      question: "How do mock exams work?",
      answer: "Mock exams simulate the real CIMA exam experience. They are timed, include a variety of question types, and provide detailed feedback upon completion. You can take mock exams multiple times to track your improvement.",
    },
    {
      question: "What happens if I fail a quiz?",
      answer: "Don't worry! You can retake quizzes as many times as you need. Each attempt helps reinforce your learning. Review the explanations provided for incorrect answers to understand the concepts better.",
    },
    {
      question: "How do I track my learning progress?",
      answer: "Your Dashboard provides a comprehensive overview of your progress including completed lessons, quiz scores, study streaks, and achievements. You can also view detailed analytics for each course you're enrolled in.",
    },
    {
      question: "Can I download course materials?",
      answer: "Yes, downloadable resources are available for most lessons. Look for the download icon next to resources like PDF summaries, formula sheets, and practice worksheets within each lesson.",
    },
    {
      question: "How do I get a certificate of completion?",
      answer: "Certificates are automatically generated when you complete all lessons and quizzes in a course with a passing score. You can download your certificates from the Achievements page or your Dashboard.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards, as well as various digital payment methods. All payments are processed securely through our payment provider.",
    },
    {
      question: "Can I get a refund?",
      answer: "Refund requests are considered within 14 days of purchase if less than 20% of the course has been completed. Please contact our support team with your order details for assistance.",
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Sign In' and then 'Forgot Password'. Enter your email address, and we'll send you a link to reset your password. The link expires after 24 hours for security.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-muted-foreground mb-8">
              Find answers to common questions or get in touch with our support team
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <span className="text-xs text-primary font-medium">{category.articles} articles</span>
              </motion.div>
            ))}
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            
            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-3">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <AccordionItem value={`item-${index}`} className="border rounded-lg px-4 bg-card">
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No results found for "{searchQuery}"</p>
                <p className="text-sm mt-2">Try a different search term or browse the categories above</p>
              </div>
            )}
          </div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed in your CIMA journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/contact">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/discussions">
                  <MessageCircle className="h-4 w-4" />
                  Community Forum
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Quick Links */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/privacy"
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors group"
            >
              <span className="font-medium">Privacy Policy</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link
              to="/terms"
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors group"
            >
              <span className="font-medium">Terms & Conditions</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link
              to="/cookies"
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors group"
            >
              <span className="font-medium">Cookie Policy</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Help;
