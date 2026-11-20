import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import InstructorProfiles from "@/components/credibility/InstructorProfiles";
import PassRateEvidenceCard from "@/components/credibility/PassRateEvidence";
import BusinessIdentity from "@/components/credibility/BusinessIdentity";
import { QualificationDisclosure } from "@/components/credibility/QualificationDisclosure";
import ExamDirectory from "@/components/exams/ExamDirectory";
export default function About() { return <Layout><SEOHead title="About Finatix" description="Finatix is an independent digital CIMA learning platform, bringing all sixteen exams and your study progress into one place." canonicalUrl="/about" />
  <section className="public-hero"><div className="container px-5 md:px-8"><p className="eyebrow">About Finatix</p><h1 className="public-title">A better place<br /><span className="text-primary">to focus.</span></h1><p className="mt-6 max-w-xl text-lg text-muted-foreground">Finatix brings the whole CIMA qualification into one connected study platform. Built for the exam you're working towards — and the person you're becoming.</p><Button asChild trace className="mt-7"><Link to="/courses">Explore the exams<ArrowUpRight /></Link></Button></div></section>
  <section className="section-space border-b border-border"><div className="container grid gap-10 px-5 md:px-8 lg:grid-cols-[1fr_1.1fr]"><h2 className="section-title max-w-md">Serious study.<br />Thoughtful technology.</h2><div className="space-y-5 text-muted-foreground"><p>Studying for CIMA takes commitment. Finding your materials, remembering where you stopped and keeping track of results shouldn't make it harder.</p><p>Our courses follow the qualification's four levels, from Certificate to Strategic. Lessons, practice, personal notes and saved progress live together, so your study stays organised.</p><p>We are an independent study provider. CIMA sets the exams, confirms exemptions and awards the qualification; Finatix provides your study workspace.</p></div></div></section>
  <ExamDirectory standalone />
  <InstructorProfiles intro="Meet the people behind the course material." /><PassRateEvidenceCard className="container mb-8" />
  <section className="section-space border-t border-border bg-secondary/40"><div className="container grid gap-10 px-5 md:px-8 lg:grid-cols-2"><div><p className="eyebrow">Here to help</p><h2 className="section-title">Get to know<br />who you're studying with.</h2><Button asChild trace variant="outline" className="mt-7"><Link to="/contact">Contact Finatix<ArrowUpRight /></Link></Button></div><div><BusinessIdentity /><div className="mt-6"><QualificationDisclosure /></div></div></div></section>
</Layout>; }
