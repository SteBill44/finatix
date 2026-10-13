import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/** Long-form explainer in the style of an "Understanding the discipline" block. CIMA structure facts only. */
const WhatIsCIMA = () => (
  <section aria-labelledby="what-heading" className="bg-background py-24 lg:py-32">
    <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Understanding CIMA</p>
        <h2 id="what-heading" className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground md:text-5xl">
          What is the CIMA qualification?
        </h2>
      </div>
      <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
        <p>
          CIMA is the professional qualification for management accountants: the people who turn financial information into business decisions.
          It is awarded by the Chartered Institute of Management Accountants, and you sit every exam with CIMA itself.
        </p>
        <p>
          The qualification runs across four levels. The Certificate builds the fundamentals. Operational, Management and Strategic each cover
          enterprise, performance and financial pillars, and each ends with a case study exam that brings the level together.
        </p>
        <Link to="/why-cima" className="group inline-flex items-center gap-2 pt-2 text-base font-semibold text-primary hover:underline">
          Read the complete guide to CIMA
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </Link>
      </div>
    </div>
  </section>
);

export default WhatIsCIMA;
