import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import SplitTextReveal from "./SplitTextReveal";

const tiers = [
  {
    badge: "Free",
    badgeTone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    title: "Start with the Fundamentals",
    description:
      "Begin with the CIMA Certificate level - our free entry point covering the essentials of business accounting. No prerequisites, no credit card, no time limits.",
    features: [
      "BA1–BA4 foundation papers",
      "Practice exams and feedback",
      "Lifetime access",
      "Earn your first certificate",
    ],
    cta: "Start free",
    ctaLink: "/auth?mode=signup",
  },
  {
    badge: "Operational",
    badgeTone: "bg-primary/15 text-primary",
    title: "Build Your Foundation",
    description:
      "Progress through E1, P1 and F1. Learn to manage performance, control costs, and report on financial position using the same techniques used in industry today.",
    features: [
      "E1 · Managing Finance in a Digital World",
      "P1 · Management Accounting",
      "F1 · Financial Reporting",
      "Operational case study prep",
    ],
    cta: "Explore Operational",
    ctaLink: "/courses",
  },
  {
    badge: "Management",
    badgeTone: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    title: "Step Into Leadership",
    description:
      "Advance through E2, P2 and F2. Develop the project management, advanced costing, and advanced financial reporting skills needed to manage teams and complex finance functions.",
    features: [
      "E2 · Managing Performance",
      "P2 · Advanced Management Accounting",
      "F2 · Advanced Financial Reporting",
      "Management case study prep",
    ],
    cta: "Explore Management",
    ctaLink: "/courses",
  },
  {
    badge: "Strategic",
    badgeTone: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    title: "Lead at the Top",
    description:
      "Stop running the numbers - start setting the direction. Apply long-term financial strategy, risk management, and value-creation frameworks at board level.",
    features: [
      "E3 · Strategic Management",
      "P3 · Risk Management",
      "F3 · Financial Strategy",
      "Strategic case study prep",
    ],
    cta: "Explore Strategic",
    ctaLink: "/courses",
  },
];

const LearningPathway = () => {
  return (
    <section className="py-10 lg:py-14 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="block text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-2">
            Learning Pathway
          </span>
          <SplitTextReveal
            as="h2"
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal mb-3 leading-[1.15]"
          >
            From Foundations to Chartered
          </SplitTextReveal>
          <p className="text-sm md:text-base text-muted-foreground">
            A structured pathway designed by CIMA-qualified practitioners to take you from
            complete beginner to fully-chartered management accountant.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.badge}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col p-5 rounded-2xl bg-background border border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
            >
              <span
                className={`inline-block self-start px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tier.badgeTone} mb-3`}
              >
                {tier.badge}
              </span>

              <h3 className="text-base md:text-lg font-bold text-charcoal mb-2">
                {tier.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {tier.description}
              </p>

              <ul className="space-y-1.5 mb-4 flex-1">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/85">{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={tier.ctaLink}
                className="inline-flex items-center justify-center text-xs font-semibold text-primary group-hover:gap-2 gap-1.5 transition-all border-t border-border/50 pt-3"
              >
                {tier.cta} →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningPathway;
