import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { CIMA_LEVELS } from "@/lib/cimaLevels";

const CimaJourney = () => (
  <Layout>
    <SEOHead
      title="Your CIMA journey: Certificate to Strategic | Finatix"
      description="The full CIMA path from the Certificate in Business Accounting through Operational, Management and Strategic levels, with the exams and award at each stage."
      canonicalUrl="https://finatix.io/cima-journey"
    />
    <section className="border-b border-border bg-secondary/50 py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <p className="eyebrow">The CIMA journey</p>
        <h1 className="max-w-4xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight md:text-6xl">
          <span className="block text-foreground">Launch your career</span>
          <span className="block text-primary">in management accounting.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Four levels take you from first principles to the CGMA designation. Here is every step, the exams in it and what you earn along the way.
        </p>
      </div>
    </section>

    <section aria-label="Path from Certificate to Strategic" className="bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <ol className="relative ml-4 border-l-2 border-primary/30 md:ml-8">
          {CIMA_LEVELS.map((lv, i) => (
            <li key={lv.id} className="relative pb-14 pl-8 last:pb-0 md:pl-14">
              <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background font-mono text-sm font-bold text-primary">
                {i + 1}
              </span>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Step 0{i + 1}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{lv.full}</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">{lv.who}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {lv.subjects.map((s) => (
                  <span key={s} className="rounded border border-border bg-card px-3 py-1 font-mono text-sm">{s}</span>
                ))}
                {lv.caseStudy && (
                  <Link to={`/courses/${lv.caseStudy.slug}`} className="rounded border border-primary/50 bg-primary/5 px-3 py-1 font-mono text-sm hover:border-primary">
                    {lv.caseStudy.code} case study
                  </Link>
                )}
              </div>
              <p className="mt-4 text-sm"><span className="text-muted-foreground">You earn: </span><strong>{lv.award}</strong></p>
              <Link to={`/courses?level=${lv.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:text-primary">
                View {lv.name} courses <ArrowUpRight className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-12 max-w-2xl text-sm text-muted-foreground">
          Relevant degrees or qualifications such as AAT may earn exemptions, so you may not need to start at the Certificate. Check CIMA's exemptions rules.
        </p>
      </div>
    </section>

    <section className="border-t border-border bg-secondary/50 py-16">
      <div className="container mx-auto flex flex-col items-start gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold md:text-3xl">Ready to take the first step?</h2>
        <Button asChild size="lg" trace><Link to="/courses">Explore CIMA Courses <ArrowRight /></Link></Button>
      </div>
    </section>
  </Layout>
);

export default CimaJourney;
