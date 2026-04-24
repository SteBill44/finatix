import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import Hero from "@/components/home/Hero";
import WhatIsCIMA from "@/components/home/WhatIsCIMA";
import Features from "@/components/home/Features";
import LearningPathway from "@/components/home/LearningPathway";
import CareerPathways from "@/components/home/CareerPathways";

import HowToBegin from "@/components/home/HowToBegin";
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
