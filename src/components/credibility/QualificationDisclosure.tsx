import { Info, Check, ArrowUpRight } from "lucide-react";
import {
  CIMA_RELATIONSHIP,
  RESPONSIBILITIES,
  CERTIFICATE_MEANING,
} from "@/lib/claims";
import { SourceLink } from "./SourceLink";

/**
 * The plain-English boundary between what Finatix provides and what CIMA
 * awards. Used anywhere a visitor could otherwise assume we award the
 * qualification or that official fees are bundled into our price.
 */
export function QualificationDisclosure({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground">
        {CIMA_RELATIONSHIP.shortStatement} {RESPONSIBILITIES.feesNotIncluded}{" "}
        <SourceLink source={RESPONSIBILITIES.feesSource} prefix="Official fees:" />
      </p>
    );
  }

  return (
    <section
      aria-labelledby="qualification-disclosure-heading"
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <h2
            id="qualification-disclosure-heading"
            className="text-lg font-semibold text-foreground"
          >
            What Finatix is, and what CIMA awards
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {CIMA_RELATIONSHIP.shortStatement}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">What we provide</h3>
          <ul className="space-y-2">
            {RESPONSIBILITIES.finatixProvides.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">
            What you arrange with CIMA yourself
          </h3>
          <ul className="space-y-2">
            {RESPONSIBILITIES.studentArranges.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowUpRight className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-border space-y-2">
        <p className="text-sm text-muted-foreground">{RESPONSIBILITIES.feesNotIncluded}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{CERTIFICATE_MEANING.title}:</span>{" "}
          {CERTIFICATE_MEANING.is} {CERTIFICATE_MEANING.isNot}
        </p>
        <SourceLink source={RESPONSIBILITIES.feesSource} prefix="Official CIMA fees:" />
      </div>
    </section>
  );
}

export default QualificationDisclosure;
