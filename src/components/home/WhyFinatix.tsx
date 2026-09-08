import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

const rows: Array<[string, string]> = [
  ["Generic study plan", "Personalised study plan"],
  ["Static revision", "Adaptive practice"],
  ["Guess what to revise", "Weak areas identified for you"],
  ["Limited progress visibility", "Live progress analytics"],
  ["Revise everything", "Focus on your knowledge gaps"],
  ["Find out on exam day", "Track exam readiness as you go"],
];

const WhyFinatix = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white mb-3">
            Why Finatix?
          </h2>
          <p className="text-muted-foreground text-lg">
            The difference is not more content. It is knowing what to do with your next study hour.
          </p>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-2 text-sm font-semibold">
            <div className="px-5 py-4 bg-secondary/50 text-muted-foreground">Traditional study</div>
            <div className="px-5 py-4 bg-primary/10 text-primary">Finatix</div>
          </div>
          {rows.map(([left, right], i) => (
            <motion.div
              key={left}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="grid grid-cols-2 border-t border-border"
            >
              <div className="px-5 py-4 flex items-start gap-2.5 text-muted-foreground">
                <Minus className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{left}</span>
              </div>
              <div className="px-5 py-4 flex items-start gap-2.5 text-charcoal dark:text-white bg-primary/[0.04]">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>{right}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyFinatix;
