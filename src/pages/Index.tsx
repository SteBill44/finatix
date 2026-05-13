import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/home/Hero";
import WhatIsCIMA from "@/components/home/WhatIsCIMA";
import ScrollReveal from "@/components/home/ScrollReveal";
import Features from "@/components/home/Features";
import LearningPathway from "@/components/home/LearningPathway";
import CareerPathways from "@/components/home/CareerPathways";

import HowToBegin from "@/components/home/HowToBegin";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

const BASE_URL = "https://finatix.com";

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
        acceptedAnswer: { "@type": "Answer", text: "No. CIMA exam vouchers need to be purchased separately through CIMA. You can find further information about this on our CIMA Accreditation page." },
      },
      {
        "@type": "Question",
        name: "Can I add my certification to my resume?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely! Demonstrating your dedication to professional development in management accounting is always a great idea. Our certifications are already recognised by leading professionals who value our training and certifications." },
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
      <WhatIsCIMA />
      <ScrollReveal />
      <Features />
      <LearningPathway />
      <CareerPathways />
      
      <HowToBegin />
      <FAQ />
      <CTA />
    </Layout>
  );
};

export default Index;
