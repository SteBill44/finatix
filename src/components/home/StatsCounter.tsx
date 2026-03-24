import { useCountUp } from "@/hooks/useCountUp";
import { Users, BookOpen, Award, Globe } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: Users, end: 2500, suffix: "+", label: "Active Students", delay: 0 },
  { icon: BookOpen, end: 15, suffix: "", label: "Expert-Led Courses", delay: 200 },
  { icon: Award, end: 92, suffix: "%", label: "Pass Rate", delay: 400 },
  { icon: Globe, end: 45, suffix: "+", label: "Countries Reached", delay: 600 },
];

const StatItem = ({ icon: Icon, end, suffix, label, delay }: typeof stats[0]) => {
  const { count, elementRef } = useCountUp({ end, duration: 2200, delay });

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="flex flex-col items-center gap-2 p-6"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <span className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </motion.div>
  );
};

const StatsCounter = () => {
  return (
    <section className="py-12 lg:py-16 bg-background border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
