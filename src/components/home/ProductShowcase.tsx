import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Flame, CheckCircle2, Clock } from "lucide-react";
import SplitTextReveal from "./SplitTextReveal";

const competencies = [
  { label: "Budgeting", score: 88, tone: "strong" as const },
  { label: "Costing techniques", score: 71, tone: "developing" as const },
  { label: "Relevant costing", score: 58, tone: "developing" as const },
  { label: "Transfer pricing", score: 34, tone: "attention" as const },
];

const toneStyles = {
  strong: { bar: "bg-[hsl(var(--success))]", chip: "text-[hsl(var(--success))]", text: "Strong" },
  developing: { bar: "bg-[hsl(var(--warning))]", chip: "text-[hsl(var(--warning))]", text: "Developing" },
  attention: { bar: "bg-destructive", chip: "text-destructive", text: "Needs attention" },
};

const ReadinessRing = ({ value }: { value: number }) => {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} className="stroke-muted" strokeWidth="10" fill="none" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          className="stroke-primary"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (c * value) / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{value}%</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Ready</span>
      </div>
    </div>
  );
};

const ProductShowcase = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-secondary/40 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
            <Sparkles className="w-4 h-4" /> Inside Finatix
          </span>
          <SplitTextReveal as="h2" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See exactly where you stand
          </SplitTextReveal>
          <p className="text-lg text-muted-foreground">
            Your dashboard turns every question you answer into a picture of your readiness, your
            strongest areas and the gaps still standing between you and a pass.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--warning))]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))]/60" />
            </div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Example data
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 p-5 sm:p-8">
            {/* Readiness */}
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-semibold text-foreground mb-1">P2 exam readiness</p>
              <p className="text-xs text-muted-foreground mb-4">Updated after every session</p>
              <div className="flex items-center gap-5">
                <ReadinessRing value={74} />
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> 612 questions done
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Flame className="w-4 h-4 text-primary" /> 12 day streak
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" /> 27 days to exam
                  </p>
                </div>
              </div>
            </div>

            {/* Competencies */}
            <div className="rounded-2xl border border-border bg-background p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Competency breakdown</p>
              <ul className="space-y-4">
                {competencies.map((c, i) => {
                  const t = toneStyles[c.tone];
                  return (
                    <li key={c.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-foreground font-medium">{c.label}</span>
                        <span className={`font-semibold ${t.chip}`}>{t.text}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${t.bar}`}
                          initial={{ width: 0 }}
                          animate={inView ? { width: `${c.score}%` } : {}}
                          transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Today's plan */}
            <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-5">
              <p className="text-sm font-semibold text-foreground mb-1">Today's plan</p>
              <p className="text-xs text-muted-foreground mb-4">Built from your last 7 sessions</p>
              <ul className="space-y-3 text-sm">
                {[
                  "20 min revision: transfer pricing",
                  "15 practice questions: relevant costing",
                  "1 lesson: divisional performance",
                  "10 min flashcard review",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground">
                Recommended study today: <strong className="text-foreground">45 minutes</strong>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link to="/demo">
            <Button size="xl" className="group">
              See a demo
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="xl" variant="outline">
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
