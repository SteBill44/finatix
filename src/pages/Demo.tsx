import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";

/**
 * Guided product demonstration. All figures are illustrative examples used to
 * explain how Finatix works - they are not real student data.
 */

const STEPS = [
  "Dashboard",
  "Knowledge analysis",
  "Recommendation",
  "AI assistant",
  "Exam readiness",
];

const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card p-5 md:p-8 shadow-lg">{children}</div>
);

const StepDashboard = () => (
  <Panel>
    <div className="grid gap-5 md:grid-cols-3">
      <div className="rounded-xl border border-border bg-background p-5">
        <p className="text-sm text-muted-foreground mb-1">P2 exam readiness</p>
        <p className="text-5xl font-bold text-primary">68%</p>
        <div className="mt-4 h-2.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: "68%" }} />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-background p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Questions completed</p>
          <p className="text-2xl font-bold text-charcoal dark:text-white">412</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Flame className="w-3 h-3 text-primary" /> Study streak
          </p>
          <p className="text-2xl font-bold text-charcoal dark:text-white">12 days</p>
        </div>
      </div>
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
          Recommended study
        </p>
        <p className="text-charcoal dark:text-white">Transfer pricing revision</p>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> 24 minutes
        </p>
      </div>
    </div>
  </Panel>
);

const areas = [
  { label: "Budgeting", status: "Strong", dot: "bg-emerald-500", pct: 88 },
  { label: "Standard costing", status: "Strong", dot: "bg-emerald-500", pct: 81 },
  { label: "Relevant costing", status: "Developing", dot: "bg-amber-500", pct: 61 },
  { label: "Variance analysis", status: "Developing", dot: "bg-amber-500", pct: 55 },
  { label: "Transfer pricing", status: "Needs attention", dot: "bg-red-500", pct: 34 },
];

const StepAnalysis = () => (
  <Panel>
    <div className="space-y-5">
      {areas.map((a) => (
        <div key={a.label}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-2 text-charcoal dark:text-white">
              <span className={`w-2.5 h-2.5 rounded-full ${a.dot}`} />
              {a.label}
            </span>
            <span className="text-muted-foreground text-xs">{a.status}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${a.dot}`} style={{ width: `${a.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  </Panel>
);

const StepRecommendation = () => (
  <Panel>
    <div className="max-w-xl">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
          Personalised recommendation
        </span>
      </div>
      <p className="text-xl md:text-2xl font-semibold text-charcoal dark:text-white mb-4">
        Your weakest area is variance analysis.
      </p>
      <p className="text-muted-foreground mb-6">
        We recommend a 20-minute revision session followed by 15 practice questions.
      </p>
      <ul className="space-y-3">
        {[
          "Revision: Sales and cost variances (20 min)",
          "15 adaptive practice questions",
          "Flashcards revisited in 3 days",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2.5 text-charcoal dark:text-white">
            <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  </Panel>
);

const StepAI = () => (
  <Panel>
    <div className="space-y-4 max-w-2xl">
      {[
        "Explain this concept in simple terms.",
        "Why did I get this question wrong?",
        "Help me revise this topic.",
      ].map((q) => (
        <div key={q} className="flex gap-3 justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm">
            {q}
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-3 text-sm text-charcoal dark:text-white">
          A favourable sales volume variance means you sold more units than budgeted. It is valued
          at standard contribution, not selling price, because the extra units still carry variable
          costs. Shall I set you three questions on this?
        </div>
      </div>
    </div>
  </Panel>
);

const StepReadiness = () => (
  <Panel>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">Before</p>
        <p className="text-5xl font-bold text-muted-foreground">68%</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <Gauge className="w-6 h-6 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Recommended study</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">After</p>
        <p className="text-5xl font-bold text-primary">74%</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-1">
          <TrendingUp className="w-3.5 h-3.5" /> +6 points
        </p>
      </div>
    </div>
  </Panel>
);

const CONTENT = [StepDashboard, StepAnalysis, StepRecommendation, StepAI, StepReadiness];

const BLURBS = [
  "Your dashboard is the single place that answers: how ready am I, and what should I do today?",
  "Every question you answer feeds a competency breakdown across the syllabus areas of your exam.",
  "Finatix turns that analysis into one concrete next action instead of a reading list.",
  "Stuck on a topic? The AI study assistant explains it, and explains the answers you got wrong.",
  "Complete the recommended study and your readiness score moves, so progress is visible.",
];

const Demo = () => {
  const [step, setStep] = useState(0);
  const Current = CONTENT[step];

  useEffect(() => {
    trackEvent("demo_start", { demo: "product_tour" });
  }, []);

  const go = (next: number) => {
    setStep(next);
    trackEvent("demo_step_view", { step_index: next + 1, step_name: STEPS[next] });
    if (next === CONTENT.length - 1) {
      trackEvent("demo_complete", { demo: "product_tour" });
    }
  };

  return (
    <Layout>
      <SEOHead
        title="See Finatix in action | Interactive CIMA platform demo"
        description="Take a 90-second tour of Finatix: exam readiness scoring, weak-area analysis, personalised study recommendations and the AI study assistant. No account needed."
        canonicalUrl="https://finatix.io/demo"
      />
      <section className="py-14 lg:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <span className="inline-block rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Demonstration - example data, not a real student
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal dark:text-white mb-3">
              See Finatix in action
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A 90-second walk through how Finatix works. No account, no card, nothing to buy.
            </p>
          </div>

          {/* Step rail */}
          <div className="flex flex-wrap gap-2 mb-6">
            {STEPS.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => go(i)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>

          <p className="text-muted-foreground mb-5">{BLURBS[step]}</p>

          <Current />

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => go(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
            <Button
              onClick={() => go(Math.min(CONTENT.length - 1, step + 1))}
              disabled={step === CONTENT.length - 1}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* End CTA */}
          <div className="mt-12 rounded-2xl border border-primary/25 bg-primary/5 p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal dark:text-white mb-2">
              Ready to start your own CIMA journey?
            </h2>
            <p className="text-muted-foreground mb-6">
              Create a free account and see where you actually stand.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth?mode=signup" onClick={() => trackEvent("demo_cta_click", { cta: "start_free" })}>
                <Button size="lg" className="w-full sm:w-auto">Start Free</Button>
              </Link>
              <Link to="/pricing" onClick={() => trackEvent("demo_cta_click", { cta: "view_pricing" })}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">View Pricing</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Demo;
