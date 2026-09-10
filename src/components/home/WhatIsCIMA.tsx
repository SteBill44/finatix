import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const levels = [
  { name: "Certificate", detail: "The fundamentals of business accounting (BA1-BA4)" },
  { name: "Operational", detail: "Short-term decision making (E1, P1, F1)" },
  { name: "Management", detail: "Medium-term performance (E2, P2, F2)" },
  { name: "Strategic", detail: "Long-term strategy and leadership (E3, P3, F3)" },
];

const WhatIsCIMA = () => {
  return (
    <section className="bg-background py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Understanding CIMA
          </p>
          <h2 className="mb-4 text-2xl font-bold leading-tight text-charcoal md:text-3xl lg:text-4xl">
            What is the CIMA qualification?
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            CIMA is the professional qualification for management accountants: the
            people who turn financial data into business decisions. It runs across
            four levels, and you sit the exams with CIMA itself.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {levels.map((level) => (
              <li key={level.name} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">{level.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{level.detail}</p>
              </li>
            ))}
          </ul>

          <Link
            to="/why-cima"
            className="group mt-8 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
          >
            Read the complete guide to CIMA
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhatIsCIMA;
