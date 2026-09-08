import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlayCircle, TrendingUp, Flame, CheckCircle2, Clock } from "lucide-react";

/**
 * Illustrative representation of the Finatix student dashboard.
 * Figures shown are example values used to explain the product, not real student data.
 */

const areas = [
  { label: "Budgeting", status: "Strong", tone: "bg-emerald-500", pct: 88 },
  { label: "Relevant costing", status: "Developing", tone: "bg-amber-500", pct: 61 },
  { label: "Transfer pricing", status: "Needs attention", tone: "bg-red-500", pct: 34 },
];

const ProductShowcase = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white mb-3">
            See exactly where you stand
          </h2>
          <p className="text-muted-foreground text-lg">
            Every answer you give updates your exam readiness, your competency breakdown and your
            next recommended study session.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/40">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs text-muted-foreground">
              Example dashboard - illustrative figures
            </span>
          </div>

          <div className="p-5 md:p-8 grid gap-6 lg:grid-cols-3">
            {/* Readiness */}
            <div className="rounded-xl border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground mb-1">P2 exam readiness</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-primary">74</span>
                <span className="text-2xl font-bold text-primary mb-1">%</span>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: "74%" }} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Up 6 points in the last 7 days
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Questions done</p>
                  <p className="text-xl font-bold text-charcoal dark:text-white">412</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Flame className="w-3 h-3 text-primary" /> Streak
                  </p>
                  <p className="text-xl font-bold text-charcoal dark:text-white">12 days</p>
                </div>
              </div>
            </div>

            {/* Competency breakdown */}
            <div className="rounded-xl border border-border bg-background p-6">
              <p className="text-sm font-semibold text-charcoal dark:text-white mb-4">
                Competency breakdown
              </p>
              <div className="space-y-4">
                {areas.map((a) => (
                  <div key={a.label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-charcoal dark:text-white">{a.label}</span>
                      <span className="text-muted-foreground text-xs">{a.status}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${a.tone}`} style={{ width: `${a.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-primary/25 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                  Recommended next
                </p>
                <p className="text-sm text-charcoal dark:text-white">
                  Transfer pricing revision, then 15 practice questions
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> About 24 minutes
                </p>
              </div>
            </div>

            {/* Study plan */}
            <div className="rounded-xl border border-border bg-background p-6">
              <p className="text-sm font-semibold text-charcoal dark:text-white">
                Your personalised plan
              </p>
              <p className="text-xs text-muted-foreground mb-4">27 days until your exam</p>
              <ul className="space-y-3">
                {[
                  "18 practice questions",
                  "1 lesson: Divisional performance",
                  "10-minute revision session",
                  "Weak-area exercise: transfer pricing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-charcoal dark:text-white">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">Latest mock exam</p>
                <p className="text-lg font-bold text-charcoal dark:text-white">
                  68% <span className="text-sm font-normal text-muted-foreground">of 60 questions</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/demo">
            <Button size="lg" className="w-full sm:w-auto">
              <PlayCircle className="mr-2 h-5 w-5" />
              See a Demo
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Start Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
