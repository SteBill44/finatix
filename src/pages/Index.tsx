import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/home/Hero";
import JourneyPicker from "@/components/home/JourneyPicker";
import WhatIsCIMA from "@/components/home/WhatIsCIMA";

import Features from "@/components/home/Features";
import LearningPathway from "@/components/home/LearningPathway";
import CareerPathways from "@/components/home/CareerPathways";

import HowToBegin from "@/components/home/HowToBegin";
import FAQ from "@/components/home/FAQ";
import TestimonialsSection from "@/components/credibility/TestimonialsSection";
import CTA from "@/components/home/CTA";
import OfferSummary from "@/components/home/OfferSummary";
import InstructorProfiles from "@/components/credibility/InstructorProfiles";

const BASE_URL = "https://finatix.io";

const homepageSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Finatix",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    sameAs: ["https://twitter.com/Finatix"],
    description: "CIMA training and exam preparation platform offering courses from Certificate to Strategic level.",
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", url: `${BASE_URL}/contact` },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Finatix",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/courses?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long do I have to complete my training course?",
        acceptedAnswer: { "@type": "Answer", text: "You will have lifetime access to your course. You can work through your course at a pace that suits you. Once you have completed your course you will retain your access and be able to jump back in any time you want to refresh your memory." },
      },
      {
        "@type": "Question",
        name: "When will my training course start?",
        acceptedAnswer: { "@type": "Answer", text: "Our courses are delivered on-demand. This means you can start and stop learning whenever you like. There is no time limit and no restriction on how many times you can access course content." },
      },
      {
        "@type": "Question",
        name: "Does my course purchase include a CIMA exam voucher?",
        acceptedAnswer: { "@type": "Answer", text: "No. Your Finatix price covers Finatix study material only. CIMA registration, the annual student subscription and every exam fee are set and charged by AICPA & CIMA and paid directly to them. Current fees are listed on the AICPA & CIMA fees page." },
      },
      {
        "@type": "Question",
        name: "Is Finatix accredited by CIMA?",
        acceptedAnswer: { "@type": "Answer", text: "No. Finatix is an independent study provider. We are not accredited by, approved by, affiliated with or endorsed by CIMA or AICPA & CIMA. Our courses are written to the published CIMA syllabus areas, and CIMA remains the only body that sets the exams and awards the qualification." },
      },
      {
        "@type": "Question",
        name: "Can I put my Finatix certificate on my CV?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, as evidence of the study you have completed. It is a Finatix certificate of completion showing you finished a Finatix course and passed its final assessment. It is not a CIMA qualification, a CIMA exam result, CIMA membership or a professional designation, and it gives no exemption from any CIMA exam." },
      },
      {
        "@type": "Question",
        name: "Can I buy training courses for people in my company?",
        acceptedAnswer: { "@type": "Answer", text: "Yes! You can create an account for an individual and purchase a course for them through our online payment portal for instant access. Alternatively, for multiple employees please get in contact with us using our contact form." },
      },
    ],
  },
];

const Index = () => {
  return (
    <Layout>
      <SEOHead
        description="Master your CIMA qualification with Finatix. Comprehensive courses from Certificate to Strategic level, practice exams, and AI-powered study tools."
        keywords="CIMA, management accounting, CIMA training, CIMA courses, CIMA exam prep"
        canonicalUrl={BASE_URL}
      />
      <JsonLd schema={homepageSchemas} id="homepage-schema" />
      <Hero />
      <JourneyPicker />
      <LearningPathway />
      <Features />
      <InstructorProfiles intro="Every tutor listed here teaches on the platform, and their qualifications are shown in full so you can check them." />
      <HowToBegin />
      <OfferSummary />
      <WhatIsCIMA />
      <CareerPathways />
      <TestimonialsSection />
      <FAQ />
      <CTA />
    </Layout>
  );
};

export default Index;
