import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/home/Hero";
import ProductShowcase from "@/components/home/ProductShowcase";
import KnowWhereYouStand from "@/components/home/KnowWhereYouStand";
import WhyFinatix from "@/components/home/WhyFinatix";
import AIAssistantSection from "@/components/home/AIAssistantSection";
import WhatIsCIMA from "@/components/home/WhatIsCIMA";
import Features from "@/components/home/Features";
import LearningPathway from "@/components/home/LearningPathway";
import CareerPathways from "@/components/home/CareerPathways";
import HowToBegin from "@/components/home/HowToBegin";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import { HOMEPAGE_FAQS } from "@/content/faqs";

const BASE_URL = "https://finatix.io";

const homepageSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Finatix",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    sameAs: ["https://twitter.com/Finatix"],
    description:
      "AI-powered CIMA learning platform with adaptive practice, mock exams, personalised study plans and exam readiness tracking.",
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
    mainEntity: HOMEPAGE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  },
];

const Index = () => {
  return (
    <Layout>
      <SEOHead
        title="Finatix | The smarter way to pass CIMA"
        description="AI-powered CIMA learning that adapts to what you know, identifies what you don't, and tells you exactly what to study next. Start free, no card needed."
        keywords="CIMA, CIMA course, CIMA revision, CIMA practice questions, CIMA mock exam, management accounting"
        canonicalUrl={BASE_URL}
      />
      <JsonLd schema={homepageSchemas} id="homepage-schema" />
      <Hero />
      <ProductShowcase />
      <KnowWhereYouStand />
      <WhyFinatix />
      <AIAssistantSection />
      <WhatIsCIMA />
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
