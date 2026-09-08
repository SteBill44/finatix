import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Activity,
  Lightbulb,
  Bot,
  TrendingUp,
  Flame,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { funnel } from "@/lib/analytics";

const steps = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "analysis", label: "Knowledge analysis", icon: Activity },
  { key: "recommendation", label: "Your next session", icon: Lightbulb },
  { key: "assistant", label: "AI study assistant", icon: Bot },
  { key: "readiness", label: "Readiness grows", icon: TrendingUp },
];

const Bar = ({ label, value, tone }: { label: string; value: number; tone: string }) => (
  <div>
    <div className="flex items-center justify-between text-xs mb-1.5">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">{value}%</span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${tone}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  </div>
);

const Demo = () => {
  const [step, setStep] = useState(0);
  const [studied, setStudied] = useState(false);

  useEffect(() => {
    funnel.demoStarted();
  }, []);

  useEffect(() => {
    funnel.demoStep(step + 1, steps[step].key);
    if (step === steps.length - 1) funnel.demoCompleted();
  }, [step]);

  const Current = steps[step].icon;

  return (
    <Layout>
      <SEOHead
        title="See Finatix in action - interactive CIMA platform demo"
        description="Walk through the Finatix CIMA learning platform in 60 seconds. See exam readiness, weak-area analysis, personalised study plans and the AI study assistant. No account needed."
        canonicalUrl="https://finatix.io/demo"
      />

      <section className="pt-28 pb-16 lg:pb-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-4">
              Interactive demo - example data
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              See Finatix in action
            </h1>
            <p className="text-lg text-muted-foreground">
              A 60 second walk through of how Finatix works. No account, no card, nothing to buy.
              Every figure below is an illustrative example, not a real student.
            </p>
          </div>

          {/* Step rail */}
          <div className="max-w-4xl mx-auto mb-6 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max justify-center pb-1">
              {steps.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Current className="w-4 h-4 text-primary" />
                Step {step + 1} of {steps.length}: {steps[step].label}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Example data
              </span>
            </div>

            <div className="p-5 sm:p-8 min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={steps[step].key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  {step === 0 && (
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="rounded-2xl border border-border p-5">
                        <p className="text-sm text-muted-foreground mb-1">P2 exam readiness</p>
                        <p className="text-5xl font-bold text-primary mb-3">68%</p>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "68%" }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border p-5 space-y-3 text-sm">
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary" /> 478 questions completed
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Flame className="w-4 h-4 text-primary" /> 9 day study streak
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary" /> 27 days until exam
                        </p>
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="w-4 h-4 text-primary" /> Last mock: 61%
                        </p>
                      </div>
                      <div className="sm:col-span-2 rounded-2xl border border-primary/30 bg-primary/[0.04] p-5">
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Recommended study today
                        </p>
                        <p className="text-sm text-muted-foreground">
                          24 minutes, focused on your two weakest areas.
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <p className="text-sm text-muted-foreground">
                        Every answer updates your syllabus map, so nothing hides until exam day.
                      </p>
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-semibold text-[hsl(var(--success))] mb-3 uppercase tracking-wider">
                            Strong
                          </p>
                          <div className="space-y-4">
                            <Bar label="Budgeting" value={88} tone="bg-[hsl(var(--success))]" />
                            <Bar label="Cost accounting" value={82} tone="bg-[hsl(var(--success))]" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[hsl(var(--warning))] mb-3 uppercase tracking-wider">
                            Developing
                          </p>
                          <Bar label="Relevant costing" value={58} tone="bg-[hsl(var(--warning))]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-destructive mb-3 uppercase tracking-wider">
                            Needs attention
                          </p>
                          <div className="space-y-4">
                            <Bar label="Transfer pricing" value={34} tone="bg-destructive" />
                            <Bar label="Variance analysis" value={29} tone="bg-destructive" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="max-w-xl mx-auto text-center py-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Lightbulb className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">
                        Your weakest area is variance analysis
                      </h2>
                      <p className="text-muted-foreground mb-8">
                        We recommend a 20 minute revision session followed by 15 practice questions.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-left">
                        <div className="rounded-xl border border-border p-4">
                          <p className="text-sm font-semibold text-foreground mb-1">
                            20 min revision
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sales and cost variances, worked through step by step.
                          </p>
                        </div>
                        <div className="rounded-xl border border-border p-4">
                          <p className="text-sm font-semibold text-foreground mb-1">
                            15 practice questions
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Difficulty matched to where you are right now.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="max-w-xl mx-auto space-y-4">
                      {[
                        {
                          q: "Explain transfer pricing in simple terms.",
                          a: "Transfer pricing is the price one division charges another for goods or services inside the same company. It matters because it shifts profit between divisions, which changes how each one's performance looks.",
                        },
                        {
                          q: "Why did I get that last question wrong?",
                          a: "You used the actual quantity at standard price for the usage variance. Usage should be valued at standard price but based on the difference between standard quantity for actual output and actual quantity used.",
                        },
                        {
                          q: "Help me revise this topic.",
                          a: "Here are three short recall questions and a worked example. I will come back to this topic in two days as part of your spaced repetition.",
                        },
                      ].map((m) => (
                        <div key={m.q} className="space-y-2">
                          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                            {m.q}
                          </div>
                          <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-foreground">
                            {m.a}
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        Example conversation. The real assistant answers using your own course
                        content and your answer history.
                      </p>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="max-w-lg mx-auto text-center py-4">
                      <p className="text-sm text-muted-foreground mb-8">
                        Complete the recommended study and watch readiness move.
                      </p>
                      <div className="flex items-center justify-center gap-6 mb-8">
                        <div>
                          <p className="text-4xl font-bold text-muted-foreground">68%</p>
                          <p className="text-xs text-muted-foreground mt-1">Before</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-4xl font-bold text-primary">
                            {studied ? "74%" : "68%"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">After</p>
                        </div>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden mb-6">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          animate={{ width: studied ? "74%" : "68%" }}
                          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      {!studied ? (
                        <Button size="lg" onClick={() => setStudied(true)}>
                          Complete the recommended study
                        </Button>
                      ) : (
                        <p className="text-sm text-foreground">
                          Readiness up 6 points, and variance analysis moves out of the red.
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border bg-muted/30">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} className="group">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">End of demo</span>
              )}
            </div>
          </div>

          {/* Closing CTA */}
          <div className="max-w-2xl mx-auto text-center mt-14">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Ready to start your own CIMA journey?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup" onClick={() => funnel.demoCta("start_free")}>
                <Button size="xl">Start free</Button>
              </Link>
              <Link to="/pricing" onClick={() => funnel.demoCta("view_pricing")}>
                <Button size="xl" variant="outline">
                  View pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Demo;
