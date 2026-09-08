import { motion } from "framer-motion";
import { Target, Repeat, ShieldCheck } from "lucide-react";
import SplitTextReveal from "./SplitTextReveal";

const stages = [
  {
    icon: Target,
    step: "01",
    title: "Assess",
    description:
      "Every question you answer feeds a picture of what you already know and where you are weak, broken down by syllabus area.",
  },
  {
    icon: Repeat,
    step: "02",
    title: "Adapt",
    description:
      "Finatix recommends the lessons, practice questions and revision that will move your score the most, and revisits them on a spaced schedule.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Prepare",
    description:
      "Track your exam readiness as it climbs, and see the gaps still left before you sit the real thing.",
  },
];

const KnowWhereYouStand = () => (
  <section className="py-16 lg:py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <SplitTextReveal as="h2" className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
          Know where you stand. Know what to study. Know when you're ready.
        </SplitTextReveal>
        <p className="text-lg text-muted-foreground">
          Most CIMA study is a guess. Finatix continuously analyses your performance and turns it
          into a clear instruction for what to do next.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-border bg-card p-7 hover:border-primary/40 transition-colors"
          >
            <span className="absolute top-6 right-7 text-4xl font-bold text-muted/70 select-none">
              {stage.step}
            </span>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <stage.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{stage.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{stage.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default KnowWhereYouStand;
