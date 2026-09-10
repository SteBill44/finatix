import { Award } from "lucide-react";
import { PASS_RATE } from "@/data/results";

/**
 * Publishes a pass rate only alongside the evidence behind it: which exam
 * window it covers, how many students it is based on and how it was measured.
 * Renders nothing while no verified figure exists.
 */
export function PassRateEvidenceCard({ className = "" }: { className?: string }) {
  if (!PASS_RATE) return null;

  return (
    <div className={`bg-card rounded-2xl border border-border p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <Award className="w-6 h-6 text-primary" />
        <p className="text-3xl font-bold text-foreground">{PASS_RATE.passRate}%</p>
      </div>
      <p className="font-medium text-foreground">
        Pass rate, {PASS_RATE.examPeriod}
      </p>
      <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <div>
          <dt className="inline font-medium text-foreground">Based on: </dt>
          <dd className="inline">{PASS_RATE.sampleSize} students</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">How it's measured: </dt>
          <dd className="inline">{PASS_RATE.method}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">Last updated: </dt>
          <dd className="inline">{PASS_RATE.lastUpdated}</dd>
        </div>
      </dl>
    </div>
  );
}

export default PassRateEvidenceCard;
