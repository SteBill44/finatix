import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import Hero from "@/components/home/Hero";
import StatsCounter from "@/components/home/StatsCounter";
import CourseLevels from "@/components/home/CourseLevels";
import Features from "@/components/home/Features";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

const Index = () => {
  return (
    <Layout>
      <SEOHead 
        description="Master your CIMA qualification with Finatix. Comprehensive courses from Certificate to Strategic level, practice exams, and AI-powered study tools."
        keywords="CIMA, management accounting, CIMA training, CIMA courses, CIMA exam prep"
      />
      <Hero />
      <StatsCounter />
      <CourseLevels />
      <Features />
      <FAQ />
      <CTA />
    </Layout>
  );
};

export default Index;
