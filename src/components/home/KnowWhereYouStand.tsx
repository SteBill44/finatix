import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gauge, Repeat, Target } from "lucide-react";

const stages = [
  {
    icon: Gauge,
    step: "1",
    title: "Assess",
    body: "Practice questions and mock exams build a picture of what you already know and where you are weak, syllabus area by syllabus area.",
  },
  {
    icon: Repeat,
    step: "2",
    title: "Adapt",
    body: "Finatix recommends the questions, lessons and revision that target your gaps, and brings weak topics back through spaced repetition.",
  },
  {
    icon: Target,
    step: "3",
    title: "Prepare",
    body: "Track an exam readiness score that moves as you study, so you can see the gaps that are left before you sit the real thing.",
  },
];

const KnowWhereYouStand = () => {
  return (
    <section className="py-16 lg:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal dark:text-white leading-tight">
            Know where you stand.
            <br />
            Know what to study.
            <br />
            <span className="text-gradient-brand">Know when you're ready.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Finatix keeps analysing your performance as you work, so studying stops being guesswork.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stages.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl border border-border bg-background p-7"
            >
              <span className="absolute top-6 right-7 text-5xl font-bold text-primary/10">
                {s.step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-charcoal dark:text-white mb-2">{s.title}</h3>
              <p className="text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10">
          <Link to="/demo">
            <Button size="lg" variant="outline">
              See how it works
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default KnowWhereYouStand;
