import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/home/Hero";
import LevelsSection from "@/components/home/LevelsSection";
import WhyFinatix from "@/components/home/WhyFinatix";
import StudyApproach from "@/components/home/StudyApproach";
import WhatIsCIMA from "@/components/home/WhatIsCIMA";
import QualificationDisclosure from "@/components/credibility/QualificationDisclosure";
import FAQ, { HOME_FAQS } from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";

const BASE_URL = "https://finatix.io";

const homepageSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Finatix",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    sameAs: ["https://twitter.com/Finatix"],
    description: "Independent CIMA study platform covering Certificate, Operational, Management and Strategic levels and case studies.",
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
    mainEntity: HOME_FAQS.map((f) => ({
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
        description="Independent CIMA study for every level, from Certificate to Strategic case study. Free Certificate courses, syllabus-mapped lessons and marked practice."
        keywords="CIMA, management accounting, CIMA training, CIMA courses, CIMA exam prep"
        canonicalUrl={BASE_URL}
      />
      <JsonLd schema={homepageSchemas} id="homepage-schema" />
      <Hero />
      <WhatIsCIMA />
      <LevelsSection />
      <WhyFinatix />
      <StudyApproach />
      <section aria-label="Independence" className="bg-background pt-20">
        <div className="container mx-auto px-4">
          <QualificationDisclosure compact />
        </div>
      </section>
      <FAQ />
      <FinalCTA />
    </Layout>
  );
};

export default Index;
