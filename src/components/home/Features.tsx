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
      title: "CIMA Competency Analytics",
      description: "AI-powered analysis identifies your weak areas in each CIMA syllabus and creates personalized study plans.",
    },
    {
      icon: Target,
      title: "Adaptive CIMA Learning",
      description: "Focus on topics where you need improvement. Our system adapts to your CIMA exam preparation needs.",
    },
    {
      icon: BarChart2,
      title: "CIMA Progress Tracking",
      description: "Track your improvement across all CIMA competencies with intuitive charts aligned to exam requirements.",
    },
    {
      icon: FileQuestion,
      title: "CIMA Mock Exams",
      description: "Practice with 5,000+ CIMA-style questions and realistic mock exams that mirror actual CIMA exam format.",
    },
    {
      icon: Smartphone,
      title: "Mobile CIMA Study",
      description: "Study for your CIMA exams anywhere. Fully responsive platform for phone, tablet, and desktop.",
    },
    {
      icon: Zap,
      title: "Instant CIMA Feedback",
      description: "Get immediate explanations for every CIMA question, helping you learn from mistakes and improve faster.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background hex-pattern">
      <div className="container mx-auto px-4">
        {/* Header - CIMA optimized */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            CIMA Study Platform
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
            Why Choose <span className="text-primary">Finaptics</span> for CIMA
          </h2>
          <p className="text-lg text-muted-foreground">
            Our CIMA course platform goes beyond traditional learning with data-driven insights that help you pass your CIMA exams first time.
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