import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/home/Hero";
import PlatformTabs from "@/components/home/PlatformTabs";
import StartChooser from "@/components/home/StartChooser";
import CourseAvailability from "@/components/home/CourseAvailability";
import OfferSummary from "@/components/home/OfferSummary";
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
    description: "Independent CIMA study platform. Free BA1 and BA2 exam-style practice with worked explanations; higher levels in development.",
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
        description="Practise CIMA BA1 and BA2 free: about 190 exam-style questions per paper in short lesson quizzes, each with a worked explanation. Outlines for every CIMA paper."
        keywords="CIMA, management accounting, CIMA training, CIMA courses, CIMA exam prep"
        canonicalUrl={BASE_URL}
      />
      <JsonLd schema={homepageSchemas} id="homepage-schema" />
      <Hero />
      <PlatformTabs />
      <StartChooser />
      <CourseAvailability />
      <OfferSummary />
      <section aria-label="Independence" className="bg-background pt-16">
        <div className="container mx-auto max-w-4xl px-4">
          <QualificationDisclosure compact />
        </div>
      </section>
      <FAQ />
      <FinalCTA />
    </Layout>
  );
};

export default Index;
