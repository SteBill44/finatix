import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POLICY } from "@/lib/catalogue";
import { COMPANY } from "@/lib/company";

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
    <section className="bg-card py-12 lg:py-16 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            What it costs
          </p>
          <h2 className="mb-3 text-2xl font-bold text-charcoal md:text-3xl lg:text-4xl">
            Pay for what you need
          </h2>
          <p className="text-muted-foreground">
            All prices include VAT, so the price you see is the price you pay.
            {" "}{POLICY.refundText}.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((option) => (
            <div
              key={option.name}
              className={`flex flex-col rounded-2xl border bg-background p-5 ${
                option.highlight ? "border-primary/60" : "border-border"
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
