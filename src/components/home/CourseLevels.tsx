import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, BarChart3, Target } from "lucide-react";

const CourseLevels = () => {
  const levels = [
    {
      title: "Operational",
      subtitle: "Level",
      description: "Build your foundation in management accounting, financial reporting, and business operations.",
      exams: ["BA1", "BA2", "BA3", "BA4"],
      icon: BookOpen,
      color: "from-teal to-teal-light",
      delay: "0",
    },
    {
      title: "Management",
      subtitle: "Level",
      description: "Develop advanced skills in performance management, financial strategy, and risk assessment.",
      exams: ["E1", "P1", "F1"],
      icon: BarChart3,
      color: "from-primary to-royal-blue-dark",
      delay: "150",
    },
    {
      title: "Strategic",
      subtitle: "Level",
      description: "Master strategic decision-making, enterprise management, and financial policy at the highest level.",
      exams: ["E2", "P2", "F2", "E3", "P3", "F3"],
      icon: Target,
      color: "from-accent to-teal",
      delay: "300",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            CIMA Qualification Pathway
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Your Journey to{" "}
            <span className="gradient-text">CIMA Success</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Progress through three levels of expertise, from foundational concepts to strategic mastery.
          </p>
        </div>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {levels.map((level, index) => (
            <div
              key={level.title}
              className="group relative bg-card rounded-2xl border border-border p-8 hover-lift overflow-hidden"
              style={{ animationDelay: `${level.delay}ms` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-6`}>
                <level.icon className="w-7 h-7 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-foreground mb-1">{level.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{level.subtitle}</p>
                <p className="text-muted-foreground mb-6">{level.description}</p>

                {/* Exams */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {level.exams.map((exam) => (
                    <span
                      key={exam}
                      className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
                    >
                      {exam}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to={`/courses?level=${level.title.toLowerCase()}`}
                  className="inline-flex items-center gap-2 text-primary font-medium group/link"
                >
                  Explore {level.title} Courses
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Connection Line (for desktop) */}
              {index < levels.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-5 w-8 lg:w-10 h-0.5 bg-gradient-to-r from-border to-transparent z-20" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-lg text-primary font-medium hover:underline"
          >
            View All Courses
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CourseLevels;
