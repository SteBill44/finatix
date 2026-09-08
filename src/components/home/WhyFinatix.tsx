import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SplitTextReveal from "./SplitTextReveal";

const rows: [string, string][] = [
  ["Generic study plan", "Personalised study plan"],
  ["Static revision", "Adaptive practice"],
  ["Guess what to revise", "Weak areas identified for you"],
  ["Limited progress visibility", "Live progress analytics"],
  ["Revise everything", "Focus on your knowledge gaps"],
  ["Find out on exam day", "Track exam readiness as you go"],
];

const WhyFinatix = () => (
  <section className="py-16 lg:py-24 bg-secondary/40">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <SplitTextReveal as="h2" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Why Finatix?
        </SplitTextReveal>
        <p className="text-lg text-muted-foreground">
          The difference is not more content. It is knowing which content you actually need.
        </p>
      </div>

      <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-2 border-b border-border">
          <div className="px-5 py-4 text-sm font-semibold text-muted-foreground">
            Traditional study
          </div>
          <div className="px-5 py-4 text-sm font-semibold text-primary border-l border-border">
            With Finatix
          </div>
        </div>
        {rows.map(([left, right], i) => (
          <motion.div
            key={right}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="grid grid-cols-2 border-b border-border last:border-b-0"
          >
            <div className="flex items-start gap-3 px-5 py-4 text-sm text-muted-foreground">
              <Minus className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {left}
            </div>
            <div className="flex items-start gap-3 px-5 py-4 text-sm text-foreground border-l border-border bg-primary/[0.03]">
              <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              {right}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <Link to="/auth?mode=signup">
          <Button size="xl">Start free</Button>
        </Link>
        <Link to="/demo">
          <Button size="xl" variant="outline">See a demo</Button>
        </Link>
      </div>
    </div>
  </section>
);

export default WhyFinatix;
