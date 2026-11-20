import Layout from "@/components/layout/Layout";


import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ExamDirectory from "@/components/exams/ExamDirectory";
import { SourceLink } from "@/components/credibility/SourceLink";
import { QualificationDisclosure } from "@/components/credibility/QualificationDisclosure";
import { CIMA_CLAIMS, type ClaimSource } from "@/lib/claims";
import { 
  GraduationCap, 
  Globe, 
  TrendingUp, 
  Award, 
  Users, 
  Briefcase,
  Target,
  CheckCircle2,
  ArrowRight,
  Building2,
  DollarSign,
  BookOpen
} from "lucide-react";

const WhyCIMA = () => {
  // Every externally verifiable statement below is recorded in src/lib/claims.ts
  // with its source and the date it was last checked.
  const benefits: Array<{ icon: React.ElementType; title: string; description: string; source?: ClaimSource }> = [
    {
      icon: Globe,
      title: "Global Recognition",
      description:
        "AICPA & CIMA members, candidates and registrants are based in 188 countries and territories.",
      source: CIMA_CLAIMS.countries.source
    },
    {
      icon: TrendingUp,
      title: "Career Progression",
      description:
        "AICPA & CIMA publish salary data for CGMA designation holders and candidates, so you can check current earnings for your role and region yourself.",
      source: CIMA_CLAIMS.salary.source
    },
    {
      icon: Briefcase,
      title: "Business Focus",
      description:
        "CIMA's syllabus centres on management accounting and business decision-making rather than audit and practice work."
    },
    {
      icon: Users,
      title: "Professional Community",
      description:
        "AICPA & CIMA report a combined community of 597,000 members, candidates and registrants worldwide.",
      source: CIMA_CLAIMS.community.source
    },
    {
      icon: Award,
      title: "CGMA Designation",
      description:
        "Passing the exams is one part. The CGMA designation also requires a minimum of three years' verified relevant practical experience.",
      source: CIMA_CLAIMS.practicalExperience.source
    },
    {
      icon: Building2,
      title: "Where It's Used",
      description:
        "Management accounting roles sit across industry, the public sector, consulting and financial services."
    }
  ];

  const stats: Array<{ label: string; value: string; icon: React.ElementType; source?: ClaimSource }> = [
    {
      label: "Members, candidates and registrants (AICPA & CIMA combined)",
      value: "597,000",
      icon: Users,
      source: CIMA_CLAIMS.community.source
    },
    {
      label: "Countries and territories",
      value: "188",
      icon: Globe,
      source: CIMA_CLAIMS.countries.source
    },
    {
      label: "Years of verified practical experience for CGMA",
      value: "3 min.",
      icon: Briefcase,
      source: CIMA_CLAIMS.practicalExperience.source
    },
    {
      label: "Official fees are set and charged by AICPA & CIMA",
      value: "Separate",
      icon: DollarSign,
      source: CIMA_CLAIMS.fees.source
    }
  ];

  const careerPaths = [
    "Chief Financial Officer (CFO)",
    "Finance Director",
    "Management Accountant",
    "Financial Controller",
    "Business Analyst",
    "Commercial Manager",
    "Risk Manager",
    "Strategy Consultant"
  ];

  return <Layout><SEOHead title="Why CIMA?" description="Understand the CIMA qualification, its sixteen exams across four levels, practical experience requirements and official fees." canonicalUrl="/why-cima" />
    <section className="public-hero"><div className="container px-5 md:px-8"><p className="eyebrow">The CIMA qualification</p><h1 className="public-title">Finance knowledge.<br /><span className="text-primary">Business perspective.</span></h1><p className="mt-5 max-w-xl text-lg text-muted-foreground">CIMA's qualification centres on management accounting and business decision-making. Develop your knowledge from the foundations through to strategic finance.</p><Button asChild trace className="mt-7"><Link to="/courses">Explore the exams<ArrowRight /></Link></Button></div></section>
    <section className="section-space"><div className="container px-5 md:px-8"><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{benefits.map(({ icon: Icon, title, description, source }) => <div key={title} className="border-t border-border pt-6"><Icon className="mb-4 h-6 w-6 text-primary" strokeWidth={1.5} /><h2 className="text-xl font-medium">{title}</h2><p className="mt-3 text-sm text-muted-foreground">{description}</p>{source && <SourceLink source={source} className="mt-3" />}</div>)}</div></div></section>
    <ExamDirectory standalone />
    <section className="section-space border-t border-border bg-secondary/40"><div className="container grid gap-10 px-5 md:px-8 lg:grid-cols-2"><div><p className="eyebrow">Beyond the exams</p><h2 className="section-title">Know the full picture.</h2><p className="mt-5 text-muted-foreground">The CGMA designation also requires at least three years of verified relevant practical experience. CIMA confirms exemptions and charges its own registration, subscription and exam fees.</p><SourceLink source={CIMA_CLAIMS.practicalExperience.source} className="mt-3" /></div><QualificationDisclosure /></div></section>
  </Layout>;
};
export default WhyCIMA;
