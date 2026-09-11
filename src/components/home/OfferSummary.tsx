import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POLICY } from "@/lib/catalogue";
import { COMPANY } from "@/lib/company";
import SectionHeading from "./SectionHeading";

const options = [
  {
    name: "Certificate level",
    price: "Free",
    detail: "BA1-BA4. Create an account and start straight away.",
    to: "/courses",
    cta: "Browse free courses",
    highlight: true,
  },
  {
    name: "Single course",
    price: "£199",
    detail: "One paid course, yours for good. One payment, nothing renews.",
    to: "/courses",
    cta: "Choose a course",
  },
  {
    name: "A full level",
    price: "£499",
    detail: "Every course in Operational, Management or Strategic level.",
    to: "/pricing",
    cta: "See level bundles",
  },
  {
    name: "Everything",
    price: "£999",
    detail: "All courses across all four levels, with lifetime access.",
    to: "/pricing",
    cta: "See full access",
  },
];

const OfferSummary = () => {
  return (
    <section className="bg-card py-16 lg:py-24 border-y border-border">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="What it costs"
          title="Pay for what you need"
          description={`All prices include VAT, so the price you see is the price you pay. ${POLICY.refundText}.`}
        />

        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((option) => (
            <div
              key={option.name}
              className={`flex flex-col rounded-2xl border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 motion-reduce:hover:translate-y-0 ${
                option.highlight
                  ? "border-primary/60 shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {option.name}
              </h3>
              <p className="mt-2 text-3xl font-bold text-foreground">{option.price}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {option.detail}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-5 gap-1.5">
                <Link to={option.to}>
                  {option.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {[
            "Lifetime access to courses you buy",
            POLICY.refundText,
            `Support ${COMPANY.supportHours.toLowerCase()}`,
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link to="/pricing" className="font-semibold text-primary hover:underline">
            See full pricing and what's included
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OfferSummary;
