import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Target, 
  Award, 
  TrendingUp,
  GraduationCap,
  Heart,
  Lightbulb,
  ArrowRight
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
      {/* Hero */}
      <section className="relative py-14 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute bottom-20 -right-20 w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-3">
              Our Story
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Helping CIMA Students Learn Smarter
            </h1>
            <p className="text-lg text-primary-foreground/80">
              We believe that with the right tools and approach, anyone can achieve their CIMA qualification. 
              Our mission is to make that journey as efficient and effective as possible.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 40 720 60 0 20L0 60Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              Our Vision
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Transforming CIMA Education for the Digital Age
            </h2>
            <p className="text-muted-foreground mb-4">
              At Finaptics, we combine modern learning science with beautiful technology to create 
              an intuitive, engaging study experience. Our platform adapts to your learning style, 
              provides real-time insights into your progress, and delivers content that truly resonates.
            </p>
            <p className="text-muted-foreground mb-6">
              We're passionate about helping every student succeed. That's why we've built a platform 
              that doesn't just teach — it adapts, analyzes, and guides you every step of the way 
              towards your CIMA qualification.
            </p>
            <Link to="/courses">
              <Button className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-3">
              Our Values
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              What Drives Us
            </h2>
            <p className="text-muted-foreground">
              These core principles guide everything we do at Finaptics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value) => (
              <div key={value.title} className="bg-card rounded-xl border border-border p-6 hover-lift">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Rate Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
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
