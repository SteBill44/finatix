import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Target, 
  Award, 
  TrendingUp,
  GraduationCap,
  Heart,
  Lightbulb,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Student-Focused",
      description: "Everything we build is designed with our students' success in mind. Your goals are our goals."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously improve our platform with the latest in educational technology and learning science."
    },
    {
      icon: Heart,
      title: "Support",
      description: "We're here for you every step of the way, from your first lesson to your final exam."
    },
    {
      icon: TrendingUp,
      title: "Results-Driven",
      description: "Our competency-based approach is designed to maximize your chances of passing first time."
    },
  ];


  return (
    <Layout>
      <SEOHead 
        title="About Us"
        description="Learn about Finatix and our mission to help CIMA students succeed. Our student-focused approach and innovative platform transforms CIMA education."
        keywords="Finatix, about, CIMA training, management accounting education"
      />
      {/* Hero */}
      <section className="relative pt-32 lg:pt-36 pb-16 lg:pb-20 hex-pattern hero-gradient-light overflow-hidden">
        <div className="gradient-orb gradient-orb-primary w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] -top-20 -left-20 pointer-events-none" />
        <div className="gradient-orb gradient-orb-accent w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] top-1/4 -right-20 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <span className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Our Story
            </span>
            <h1 className="animate-fade-up text-4xl md:text-5xl font-bold text-foreground mb-4">
              Helping CIMA Students Learn Smarter
            </h1>
            <p className="animate-fade-up-delay-1 text-lg text-muted-foreground mb-6">
              We believe that with the right tools and approach, anyone can achieve their CIMA qualification. 
              Our mission is to make that journey as efficient and effective as possible.
            </p>
            <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row gap-4">
              <Link to="/courses">
                <Button size="lg" className="gap-2">
                  Explore Courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-10 md:py-14 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Target className="w-4 h-4" />
                Our Vision
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Transforming CIMA Education for the Digital Age
              </h2>
              <p className="text-muted-foreground mb-4">
              At Finatix, we combine modern learning science with beautiful technology to create 
              an intuitive, engaging study experience. Our platform adapts to your learning style, 
              provides real-time insights into your progress, and delivers content that truly resonates.
              </p>
              <p className="text-muted-foreground mb-6">
              We're passionate about helping every student succeed. That's why we've built a platform 
              that doesn't just teach — it adapts, analyzes, and guides you every step of the way 
              towards your CIMA qualification.
              </p>
            </div>
            <div className="grid gap-4">
              {["Adaptive learning paths", "Progress insights", "Exam-focused support"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-10 md:py-14 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Drives Us
            </h2>
            <p className="text-muted-foreground">
              These core principles guide everything we do at Finatix
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Rate Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Students Pass First Time
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our competency-based learning approach, combined with advanced analytics and personalized 
              study paths, helps students achieve their CIMA qualification.
            </p>
            <Link to="/courses">
              <Button className="gap-2">
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
