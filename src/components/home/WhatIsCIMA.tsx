import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

const levels = [
  { name: "Certificate", detail: "The fundamentals of business accounting (BA1-BA4)" },
  { name: "Operational", detail: "Short-term decision making (E1, P1, F1)" },
  { name: "Management", detail: "Medium-term performance (E2, P2, F2)" },
  { name: "Strategic", detail: "Long-term strategy and leadership (E3, P3, F3)" },
];

const WhatIsCIMA = () => {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Understanding CIMA"
          title="What is the CIMA qualification?"
          description="CIMA is the professional qualification for management accountants: the people who turn financial data into business decisions. It runs across four levels, and you sit the exams with CIMA itself."
        />

        <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {levels.map((level, i) => (
            <li
              key={level.name}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{level.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {level.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            to="/why-cima"
            className="group inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
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
