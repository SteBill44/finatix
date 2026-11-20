import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ENTRIES = [
  { title: "New to accounting", text: "Start with the Certificate in Business Accounting. Its four papers (BA1 to BA4) are free on Finatix.", to: "/courses?level=certificate", cta: "See Certificate courses" },
  { title: "Degree, AAT or exemptions", text: "You may be able to begin at Operational level. Check CIMA's exemptions rules, then pick your first paper.", to: "/courses?level=operational", cta: "See Operational courses" },
];

export default function WhereToStart() {
  return (
    <section aria-labelledby="start-title" className="section-space border-t border-border bg-secondary/50">
      <div className="container px-5 md:px-8">
        <p className="eyebrow">Where to start</p>
        <h2 id="start-title" className="section-title max-w-xl">Pick the right first step.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ENTRIES.map((e) => (
            <div key={e.title} className="flex flex-col rounded-lg border border-border bg-card p-7">
              <h3 className="text-xl font-semibold">{e.title}</h3>
              <p className="mt-2 flex-1 text-muted-foreground">{e.text}</p>
              <Button asChild trace variant="outline" className="mt-6 self-start">
                <Link to={e.to}>{e.cta} <ArrowUpRight /></Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
