import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, BookOpen, CreditCard, User, GraduationCap, MessageCircle, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const helpCategories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn the basics of using Finatix",
    faqs: [
      {
        question: "How do I create an account?",
        answer: "Click the 'Get Started' button on the homepage or navigate to the sign-up page. Enter your email address and create a password. You'll receive a confirmation email to verify your account."
      },
      {
        question: "How do I enroll in a course?",
        answer: "Browse our courses page, select the course you're interested in, and click 'Enroll Now'. If it's a paid course, you'll be guided through the payment process."
      },
      {
        question: "What are the system requirements?",
        answer: "Finatix works on any modern web browser (Chrome, Firefox, Safari, Edge). We recommend a stable internet connection for video content. Mobile devices are fully supported."
      }
    ]
  },
  {
    icon: GraduationCap,
    title: "Courses & Learning",
    description: "Questions about course content and progress",
    faqs: [
      {
        question: "How do I track my course progress?",
        answer: "Your progress is automatically tracked as you complete lessons. Visit your Dashboard to see an overview of all your enrolled courses and completion percentages."
      },
      {
        question: "Can I download course materials?",
        answer: "Yes, downloadable resources are available for most lessons. Look for the download button in the lesson resources section."
      },
      {
        question: "How do quizzes and exams work?",
        answer: "Quizzes are available at the end of each module. Mock exams simulate the real CIMA exam experience with timed conditions. Your results are saved and can be reviewed anytime."
      },
      {
        question: "What happens when I complete a course?",
        answer: "Upon completion, you'll receive a certificate of completion that you can download and share. Your achievement will also be displayed in your profile."
      }
    ]
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description: "Payment methods, invoices, and refunds",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express) as well as PayPal. All payments are processed securely."
      },
      {
        question: "Can I get a refund?",
        answer: "We offer a 14-day money-back guarantee. If you're not satisfied with your purchase, contact our support team within 14 days for a full refund."
      },
      {
        question: "How do I access my invoices?",
        answer: "Invoices are sent to your registered email after each purchase. You can also view your payment history in your account settings."
      }
    ]
  },
  {
    icon: User,
    title: "Account Management",
    description: "Profile settings and account security",
    faqs: [
      {
        question: "How do I update my profile information?",
        answer: "Go to your Dashboard and click on 'Manage Account'. From there, you can update your name, email, profile picture, and other details."
      },
      {
        question: "How do I change my password?",
        answer: "Navigate to Account Settings and select 'Change Password'. You'll need to enter your current password and then your new password twice to confirm."
      },
      {
        question: "How do I delete my account?",
        answer: "To delete your account, go to Account Settings and select 'Delete Account'. Please note this action is permanent and cannot be undone."
      }
    ]
  },
  {
    icon: Settings,
    title: "Technical Support",
    description: "Troubleshooting and technical issues",
    faqs: [
      {
        question: "Videos aren't playing. What should I do?",
        answer: "First, try refreshing the page and clearing your browser cache. Ensure you have a stable internet connection. If issues persist, try a different browser or disable browser extensions."
      },
      {
        question: "I can't log in to my account",
        answer: "Try resetting your password using the 'Forgot Password' link. If you still can't access your account, contact our support team with your registered email address."
      },
      {
        question: "The website is loading slowly",
        answer: "Check your internet connection speed. Clear your browser cache and cookies. Try using a different browser or disabling extensions that might interfere."
      }
    ]
  }
];

const HelpCentre = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0 || searchQuery === "");

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Centre</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions or get in touch with our support team
          </p>
          
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {searchQuery === "" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* FAQs */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center gap-3 mb-4">
                <category.icon className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">{category.title}</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Still need help?</h3>
                <p className="text-muted-foreground">Our support team is here to assist you</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HelpCentre;
