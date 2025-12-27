import { 
  Brain, 
  BarChart2, 
  Target, 
  Smartphone, 
  FileQuestion, 
  TrendingUp,
  Zap,
  Shield
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
      title: "Unlimited Mock Tests",
      description: "Practice with our extensive question bank and get instant breakdowns of your performance.",
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
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Why Choose CIMAStudy
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Study Smarter with{" "}
            <span className="gradient-text">Modern Tools</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform goes beyond traditional learning with data-driven insights that help you pass first time.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl border border-border p-8 hover-lift"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Comparison Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Better Value Than Kaplan
              </h3>
              <p className="text-muted-foreground max-w-xl">
                Get more features, better analytics, and a modern learning experience — all at a more competitive price point.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-6 py-4 bg-card rounded-xl border border-border">
                <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Better Analytics</p>
              </div>
              <div className="text-center px-6 py-4 bg-card rounded-xl border border-border">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Modern UI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
