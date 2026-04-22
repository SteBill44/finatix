import { motion } from "framer-motion";
import SplitTextReveal from "./SplitTextReveal";

const steps = [
  {
    title: "Create Your Free Account",
    description:
      "Sign up in under 60 seconds with just your email. No credit card, no commitments.",
  },
  {
    title: "Start the Certificate Level Free",
    description:
      "Jump straight into BA1 the moment you register. Begin building your foundation in management accounting.",
  },
  {
    title: "Train at Your Own Pace",
    description:
      "Work through video lessons, practical examples, and adaptive practice on your schedule. Lifetime access means no pressure.",
  },
  {
    title: "Progress to Higher Levels",
    description:
      "Move into Operational, Management and Strategic levels. Track your readiness with our competency radar.",
  },
  {
    title: "Sit Your CIMA Exam",
    description:
      "Book your official exam through CIMA Connect when you're ready, and earn your globally-recognised credential.",
  },
];

const HowToBegin = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="block text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">
            Getting Started
          </span>
          <SplitTextReveal
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-5 leading-[1.15]"
          >
            How to Begin Your CIMA Journey
          </SplitTextReveal>
          <p className="text-lg text-muted-foreground">
            A straightforward pathway from registration to certification — designed to fit
            around your schedule and your career.
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-5 md:left-6 top-2 bottom-2 w-px bg-border/70" />

          <ol className="space-y-8">
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-16 md:pl-20"
              >
                <div className="absolute left-0 top-0 w-10 md:w-12 h-10 md:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base md:text-lg shadow-lg shadow-primary/20">
                  {i + 1}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-charcoal mb-1.5">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {step.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowToBegin;
