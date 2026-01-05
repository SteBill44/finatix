import { 
  Brain, 
  BarChart2, 
  Target, 
  Smartphone, 
  FileQuestion, 
  Zap
} from "lucide-react";

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
      title: "Mobile-First Design",
      description: "Study anywhere, anytime. Our platform is optimized for learning on the go.",
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
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
            Why Choose <span className="text-primary">Finaptix</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform goes beyond traditional learning with data-driven insights that help you pass first time.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card hover-lift"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-charcoal mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;