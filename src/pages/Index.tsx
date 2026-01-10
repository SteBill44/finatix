import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import CourseLevels from "@/components/home/CourseLevels";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import { SEO, organizationSchema, websiteSchema } from "@/components/SEO";

const Index = () => {
  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, websiteSchema],
  };

  return (
    <Layout>
      <SEO
        title="CIMA Study Platform"
        description="Pass your CIMA exams first time with Finaptics. Modern study platform featuring competency-based analytics, adaptive learning, expert-led video courses, and mock exams."
        keywords="CIMA, CIMA courses, CIMA exam preparation, management accounting, CGMA, CIMA study, online accounting courses"
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