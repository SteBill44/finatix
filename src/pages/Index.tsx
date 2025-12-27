import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import CourseLevels from "@/components/home/CourseLevels";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <CourseLevels />
      <Features />
      <Testimonials />
      <CTA />
    </Layout>
  );
};

export default Index;
