import {
  Brain,
  BarChart2,
  Target,
  Smartphone,
  FileQuestion,
  Zap,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SplitTextReveal from "./SplitTextReveal";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      className="feature-card transition-shadow duration-500 hover:shadow-lg hover:shadow-primary/10 group"
    >
      {/* Icon with smooth scale */}
      <motion.div
        whileHover={{ scale: 1.15, rotate: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
      >
        <Icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
      </motion.div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-charcoal mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
};

const Features = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true, amount: 0.3 });

  const features = [
    {
      icon: Brain,
      title: "Competency-Based Analytics",
      description:
        "Our AI identifies your weak areas and creates personalized study plans that adapt as you learn.",
    },
    {
      icon: Target,
      title: "Adaptive Learning",
      description:
        "Focus on what matters most. Our system prioritizes topics where you need the most improvement.",
    },
    {
      icon: BarChart2,
      title: "Visual Progress Tracking",
      description:
        "See your improvement across all competencies with beautiful, intuitive charts and insights.",
    },
    {
      icon: FileQuestion,
      title: "Realistic Mock Exams",
      description:
        "Practice with exam-style questions and get instant breakdowns of your performance.",
    },
    {
      icon: Smartphone,
      title: "Phone Compatible",
      description:
        "Access your studies from any device. Our responsive platform works seamlessly on phones, tablets, and desktops.",
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description:
        "Get immediate explanations for every question, helping you learn from mistakes quickly.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background hex-pattern">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <SplitTextReveal
            as="h2"
            className="text-3xl md:text-4xl font-bold text-charcoal mb-4"
          >
            Why Choose Finatix
          </SplitTextReveal>
          <motion.p
            initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-muted-foreground"
          >
            Our platform goes beyond traditional learning with data-driven
            insights that help you pass first time.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
