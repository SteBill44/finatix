import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GraduationCap, 
  Globe, 
  TrendingUp, 
  Award, 
  Users, 
  Briefcase,
  Target,
  CheckCircle2,
  ArrowRight,
  Building2,
  DollarSign,
  BookOpen
} from "lucide-react";

const WhyCIMA = () => {
  const benefits = [
    {
      icon: Globe,
      title: "Global Recognition",
      description: "CIMA is recognised in over 100 countries worldwide, opening doors to international career opportunities."
    },
    {
      icon: TrendingUp,
      title: "Career Advancement",
      description: "CIMA-qualified professionals often command higher salaries and access senior management positions faster."
    },
    {
      icon: Briefcase,
      title: "Business Focus",
      description: "Unlike traditional accounting qualifications, CIMA focuses on strategic business management and decision-making."
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Join a community of over 150,000 members and 100,000+ students globally, with exclusive networking opportunities."
    },
    {
      icon: Award,
      title: "CGMA Designation",
      description: "Earn the prestigious Chartered Global Management Accountant designation, recognised by top employers worldwide."
    },
    {
      icon: Building2,
      title: "Industry Demand",
      description: "CIMA skills are in high demand across sectors including finance, consulting, technology, and manufacturing."
    }
  ];

  const qualificationLevels = [
    {
      level: "Certificate in Business Accounting",
      subjects: ["Business Accounting Fundamentals", "Management Accounting Fundamentals", "Ethics, Corporate Governance & Business Law"],
      description: "Foundation level covering essential accounting and business principles.",
      duration: "6-12 months",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      level: "Operational Level",
      subjects: ["E1 - Managing Finance in a Digital World", "P1 - Management Accounting", "F1 - Financial Reporting"],
      description: "Focus on operational decision-making and core financial skills.",
      duration: "12-18 months",
      color: "from-emerald-500/20 to-green-500/20"
    },
    {
      level: "Management Level",
      subjects: ["E2 - Managing Performance", "P2 - Advanced Management Accounting", "F2 - Advanced Financial Reporting"],
      description: "Develop skills for middle management and strategic planning.",
      duration: "12-18 months",
      color: "from-amber-500/20 to-orange-500/20"
    },
    {
      level: "Strategic Level",
      subjects: ["E3 - Strategic Management", "P3 - Risk Management", "F3 - Financial Strategy"],
      description: "Master strategic leadership and executive decision-making.",
      duration: "12-18 months",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      level: "Strategic Case Study",
      subjects: ["Integrated Case Study Exam"],
      description: "Apply all your knowledge in a realistic business scenario examination.",
      duration: "3-6 months",
      color: "from-primary/20 to-primary/10"
    }
  ];

  const salaryStats = [
    { label: "Average UK Salary", value: "£65,000+", icon: DollarSign },
    { label: "Salary Premium", value: "25-40%", icon: TrendingUp },
    { label: "Global Members", value: "150,000+", icon: Globe },
    { label: "Countries", value: "100+", icon: Building2 }
  ];

  const careerPaths = [
    "Chief Financial Officer (CFO)",
    "Finance Director",
    "Management Accountant",
    "Financial Controller",
    "Business Analyst",
    "Commercial Manager",
    "Risk Manager",
    "Strategy Consultant"
  ];

  return (
    <Layout>
      <SEOHead 
        title="Why CIMA? | Benefits of CIMA Qualification"
        description="Discover why CIMA is the world's largest professional body of management accountants. Learn about career benefits, qualification pathway, and global recognition."
        keywords="CIMA qualification, management accounting, CGMA, chartered accountant, finance career, CIMA benefits"
      />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>Chartered Institute of Management Accountants</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Why Choose <span className="text-primary">CIMA</span>?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              CIMA is the world's largest and leading professional body of management accountants, 
              offering a globally recognised qualification that opens doors to exciting career opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2">
                  Start Your Journey
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {salaryStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Benefits of CIMA Qualification
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A CIMA qualification equips you with the skills and credentials to succeed in today's competitive business environment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Qualification Pathway */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The CIMA Qualification Pathway
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Progress through structured levels, each building on the last to develop your expertise in management accounting and business strategy.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {qualificationLevels.map((level, index) => (
              <Card key={index} className={`overflow-hidden bg-gradient-to-r ${level.color} border-0`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/10 text-foreground font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{level.level}</h3>
                        <span className="text-sm text-muted-foreground bg-background/50 px-3 py-1 rounded-full w-fit">
                          {level.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{level.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {level.subjects.map((subject, subIndex) => (
                          <span 
                            key={subIndex}
                            className="text-xs bg-background/70 text-foreground px-3 py-1 rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Career Opportunities
              </h2>
              <p className="text-muted-foreground mb-6">
                A CIMA qualification opens doors to a wide range of senior positions across industries. 
                Whether you're aiming for the boardroom or building expertise in a specialist area, 
                CIMA provides the foundation for success.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {careerPaths.map((path, index) => (
                  <div key={index} className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{path}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/30 rounded-2xl p-8">
              <div className="text-center">
                <Target className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Begin?</h3>
                <p className="text-muted-foreground mb-6">
                  Join thousands of professionals who have transformed their careers with CIMA.
                </p>
                <Link to="/courses">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    <BookOpen className="w-4 h-4" />
                    View Our Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Your CIMA Journey Today
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Whether you're just starting out or looking to advance your career, 
            Finatix provides everything you need to succeed in your CIMA studies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Register for Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default WhyCIMA;
