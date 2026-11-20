import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import ExamDirectory from "@/components/exams/ExamDirectory";
export default function StartPaper() { const [params] = useSearchParams(); return <Layout><SEOHead title="Choose your CIMA exam" description="Find your exam in the unified Finatix CIMA catalogue." /><section className="public-hero"><div className="container px-5 md:px-8"><p className="eyebrow">CIMA exams</p><h1 className="public-title">What are you<br /><span className="text-primary">studying next?</span></h1><p className="mt-5 text-muted-foreground">Every level is here. Open an exam to see its study resources.</p>{params.get("level") && <p className="mt-2 text-sm capitalize text-muted-foreground">Your selected level: {params.get("level")}</p>}</div></section><ExamDirectory standalone /></Layout>; }
