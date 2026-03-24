import { 
  Brain, 
  BarChart2, 
  Target, 
  Smartphone, 
  FileQuestion, 
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  index 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="feature-card transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Icon */}
      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.4 }}
        className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
      >
        <Icon className="w-6 h-6 text-primary" />
      </motion.div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-charcoal mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Competency-Based Analytics",
      description: "Our AI identifies your weak areas and creates personalized study plans that adapt as you learn.",
    },
    {
      icon: Target,
      title: "Adaptive Learning",
      description: "Focus on what matters most. Our system prioritizes topics where you need the most improvement.",
    },
    {
      icon: BarChart2,
      title: "Visual Progress Tracking",
      description: "See your improvement across all competencies with beautiful, intuitive charts and insights.",
    },
    {
      icon: FileQuestion,
      title: "Realistic Mock Exams",
      description: "Practice with exam-style questions and get instant breakdowns of your performance.",
    },
    {
      icon: Smartphone,
      title: "Phone Compatible",
      description: "Access your studies from any device. Our responsive platform works seamlessly on phones, tablets, and desktops.",
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get immediate explanations for every question, helping you learn from mistakes quickly.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background hex-pattern">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
            Why Choose <span className="text-primary">Finatix</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform goes beyond traditional learning with data-driven insights that help you pass first time.
          </p>
        </motion.div>

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
