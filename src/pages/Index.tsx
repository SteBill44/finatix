import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import CourseLevels from "@/components/home/CourseLevels";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import { SEO, organizationSchema, websiteSchema, createFAQSchema } from "@/components/SEO";

const Index = () => {
  // CIMA-focused FAQ data for structured data
  const cimaFaqs = [
    {
      question: "What is CIMA and why should I get CIMA qualified?",
      answer: "CIMA (Chartered Institute of Management Accountants) is the world's largest professional body of management accountants. Getting CIMA qualified opens doors to senior finance roles, with CGMA designation holders earning significantly more than non-qualified accountants."
    },
    {
      question: "How does Finaptics help me pass CIMA exams?",
      answer: "Finaptics uses competency-based analytics to identify your weak areas in each CIMA syllabus. Our adaptive learning system creates personalized study plans, provides 5,000+ CIMA practice questions, realistic mock exams, and detailed performance tracking."
    },
    {
      question: "Which CIMA courses do you offer?",
      answer: "We offer comprehensive courses for all CIMA qualification levels: Certificate in Business Accounting (BA1-BA4), Operational Level (E1, P1, F1 + OCS), Management Level (E2, P2, F2 + MCS), and Strategic Level (E3, P3, F3 + SCS)."
    },
    {
      question: "How is Finaptics different from other CIMA course providers?",
      answer: "Unlike traditional CIMA course providers, Finaptics offers modern competency-based analytics, adaptive learning technology, intuitive mobile-first interface, unlimited mock exams, and competitive pricing compared to Kaplan and BPP."
    },
    {
      question: "What is the CGMA qualification?",
      answer: "CGMA (Chartered Global Management Accountant) is a globally recognized designation awarded when you complete all CIMA exams and gain the required work experience. Our courses prepare you for the entire CIMA qualification pathway."
    },
  ];

  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema, 
      websiteSchema,
      createFAQSchema(cimaFaqs),
      {
        '@type': 'Course',
        name: 'CIMA Professional Qualification Courses',
        description: 'Complete CIMA exam preparation courses covering Certificate, Operational, Management and Strategic levels with video lessons, practice questions and mock exams.',
        provider: {
          '@type': 'EducationalOrganization',
          name: 'Finaptics',
          url: 'https://finaptics.com',
        },
        coursePrerequisites: 'No prior accounting knowledge required for Certificate level',
        educationalLevel: 'Professional',
        teaches: ['Management Accounting', 'Financial Management', 'Strategic Management', 'Business Analysis'],
      },
    ],
  };

  return (
    <Layout>
      <SEO
        title="CIMA Courses & Exam Preparation"
        description="Pass your CIMA exams first time with Finaptics. UK's leading CIMA study platform with BA1-BA4, Operational, Management & Strategic level courses, 5,000+ practice questions, mock exams, and competency-based analytics."
        keywords="CIMA, CIMA courses, CIMA exams, CIMA study, CIMA preparation, CGMA, management accounting, BA1, BA2, BA3, BA4, E1, E2, E3, P1, P2, P3, F1, F2, F3, case study, CIMA mock exam, CIMA practice questions"
        structuredData={homeStructuredData}
      />
      <Hero />
      <CourseLevels />
      <Features />
      <Testimonials />
      <FAQ />
      <CTA />
    </Layout>
  );
};

export default Index;