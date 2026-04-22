import { motion } from "framer-motion";
import { Star } from "lucide-react";
import SplitTextReveal from "./SplitTextReveal";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { end: 92, suffix: "%", label: "Exam Pass Rate" },
  { end: 2500, suffix: "+", label: "Learners Trained" },
  { end: 4.9, suffix: "/5", label: "Average Rating", decimals: 1 },
  { end: 45, suffix: "+", label: "Countries Reached" },
];

const testimonials = [
  {
    rating: 5,
    quote:
      "Genuinely the best CIMA training I've come across. Easy to follow, properly structured, and the practice questions feel like the real exam.",
    initials: "SM",
    name: "Sarah M.",
    role: "Management Accountant",
  },
  {
    rating: 5,
    quote:
      "Quality of content and quality of the platform — both top drawer. The competency tracking actually changed how I revised.",
    initials: "CT",
    name: "Chris T.",
    role: "Finance Business Partner",
  },
  {
    rating: 5,
    quote:
      "Passed F1 first time after struggling with another provider for months. Highly recommend for anyone serious about CIMA.",
    initials: "BK",
    name: "Brod K.",
    role: "Financial Analyst",
  },
];

const StatBlock = ({
  end,
  suffix,
  label,
  decimals,
}: {
  end: number;
  suffix: string;
  label: string;
  decimals?: number;
}) => {
  const { count, elementRef } = useCountUp({ end, duration: 2200, decimals });
  return (
    <div ref={elementRef} className="text-center md:text-left">
      <div className="text-4xl md:text-5xl font-bold text-charcoal tabular-nums">
        {decimals ? count.toFixed(decimals) : count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1.5">{label}</div>
    </div>
  );
};

const LearnerOutcomes = () => {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="block text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
            Learner Success
          </span>
          <SplitTextReveal
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-5 leading-[1.15]"
          >
            Proven Learning Outcomes
          </SplitTextReveal>
          <p className="text-lg text-muted-foreground">
            We combine academic rigour with practical insight to build training that
            prepares you for the real challenges of management accounting.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16 pb-16 border-b border-border/50">
          {stats.map((s) => (
            <StatBlock key={s.label} {...s} />
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="p-6 rounded-2xl bg-background border border-border/60"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="text-foreground/90 text-sm leading-relaxed mb-5">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-charcoal">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearnerOutcomes;
