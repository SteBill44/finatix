import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Zap, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses, useEnrollments, useEnrollInCourse, useEnrollInMultipleCourses } from "@/hooks/useStudentProgress";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: courses } = useCourses();
  const { data: enrollments } = useEnrollments();
  const enrollMutation = useEnrollInCourse();
  const enrollMultipleMutation = useEnrollInMultipleCourses();

  const isEnrolled = (courseId: string) => {
    return enrollments?.some((e) => e.course_id === courseId);
  };

  const handleEnroll = async (courseId: string, courseName: string) => {
    if (!user) {
      toast.error("Please sign in to enroll");
      navigate("/auth");
      return;
    }

    if (isEnrolled(courseId)) {
      toast.info("You're already enrolled in this course");
      navigate("/dashboard");
      return;
    }

    try {
      await enrollMutation.mutateAsync(courseId);
      toast.success(`Successfully enrolled in ${courseName}!`);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll");
    }
  };

  const handleBuyLevelBundle = async (level: string, levelCourses: typeof courses) => {
    if (!user) {
      toast.error("Please sign in to purchase");
      navigate("/auth");
      return;
    }

    if (!levelCourses || levelCourses.length === 0) {
      toast.error("No courses found for this level");
      return;
    }

    const courseIds = levelCourses.map(c => c.id);
    
    try {
      const result = await enrollMultipleMutation.mutateAsync(courseIds);
      if (result.enrolled > 0) {
        toast.success(`Successfully enrolled in ${result.enrolled} ${level} level courses!`);
        navigate("/dashboard");
      } else {
        toast.info("You're already enrolled in all courses for this level");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll in bundle");
    }
  };

  const handleBuyAllCourses = async () => {
    if (!user) {
      toast.error("Please sign in to purchase");
      navigate("/auth");
      return;
    }

    if (!courses || courses.length === 0) {
      toast.error("No courses available");
      return;
    }

    const courseIds = courses.map(c => c.id);
    
    try {
      const result = await enrollMultipleMutation.mutateAsync(courseIds);
      if (result.enrolled > 0) {
        toast.success(`Successfully enrolled in ${result.enrolled} courses!`);
        navigate("/dashboard");
      } else {
        toast.info("You're already enrolled in all courses");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll in all courses");
    }
  };

  // Group courses by level
  const coursesByLevel = courses?.reduce((acc, course) => {
    const level = course.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(course);
    return acc;
  }, {} as Record<string, typeof courses>);

  const levelOrder = ['certificate', 'operational', 'management', 'strategic'];
  const levelNames: Record<string, string> = {
    certificate: 'Certificate Level (Entry Level)',
    operational: 'Operational Level',
    management: 'Management Level',
    strategic: 'Strategic Level',
  };

  const plans = [
    {
      name: "Single Module",
      description: "Perfect for focusing on one exam at a time",
      price: 149,
      period: "per module",
      features: [
        { text: "One module of your choice", included: true },
        { text: "50+ hours of video content", included: true },
        { text: "500+ practice questions", included: true },
        { text: "5 mock exams", included: true },
        { text: "Competency tracking", included: true },
        { text: "Mobile app access", included: true },
        { text: "Community support", included: true },
        { text: "1-on-1 tutor sessions", included: false },
        { text: "Priority support", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Full Level",
      description: "Complete preparation for your entire level",
      price: 449,
      period: "per level",
      originalPrice: 646,
      features: [
        { text: "All modules in one level", included: true },
        { text: "150+ hours of video content", included: true },
        { text: "1500+ practice questions", included: true },
        { text: "15 mock exams", included: true },
        { text: "Advanced competency analytics", included: true },
        { text: "Mobile app access", included: true },
        { text: "Community support", included: true },
        { text: "2 x 1-on-1 tutor sessions", included: true },
        { text: "Priority support", included: false },
      ],
      cta: "Get Full Level",
      popular: true,
    },
    {
      name: "Unlimited Bundle",
      description: "Everything you need to become CIMA qualified",
      price: 999,
      period: "lifetime access",
      originalPrice: 1940,
      features: [
        { text: "All CIMA modules", included: true },
        { text: "500+ hours of video content", included: true },
        { text: "5000+ practice questions", included: true },
        { text: "Unlimited mock exams", included: true },
        { text: "Full analytics suite", included: true },
        { text: "Mobile app access", included: true },
        { text: "Community support", included: true },
        { text: "Unlimited tutor sessions", included: true },
        { text: "Priority 24/7 support", included: true },
      ],
      cta: "Get Unlimited",
      popular: false,
    },
  ];

  const comparison = [
    { feature: "Modern, intuitive UI", us: true, kaplan: false },
    { feature: "Competency-based analytics", us: true, kaplan: false },
    { feature: "Weak area identification", us: true, kaplan: "Limited" },
    { feature: "Adaptive learning paths", us: true, kaplan: false },
    { feature: "Mobile-first design", us: true, kaplan: "Limited" },
    { feature: "Unlimited mock tests", us: true, kaplan: "Extra cost" },
    { feature: "Visual progress tracking", us: true, kaplan: "Basic" },
    { feature: "Community support", us: true, kaplan: true },
    { feature: "Lower pricing", us: true, kaplan: false },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Invest in Your CIMA Success
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Choose the plan that fits your goals. All plans include our modern analytics and learning tools.
          </p>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 40 720 60 0 20L0 60Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Individual Courses by Level */}
      {coursesByLevel && Object.keys(coursesByLevel).length > 0 && (
        <section className="py-16 lg:py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Individual Courses
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                CIMA Qualification Structure
              </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Choose individual modules or bundle an entire level for maximum savings.
            </p>
            
            {/* Buy All 15 Courses Banner */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 bg-gradient-to-r from-primary/20 via-purple/20 to-red/20 rounded-2xl border border-primary/30">
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold text-foreground">Complete CIMA Bundle - All 15 Courses</p>
                <p className="text-sm text-muted-foreground">
                  <span className="line-through">£2,235</span>
                  <span className="ml-2 text-primary font-semibold">£999 lifetime access</span>
                  <span className="ml-2 text-primary">Save £1,236!</span>
                </p>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-purple hover:opacity-90 text-white shrink-0"
                disabled={enrollMultipleMutation.isPending}
                onClick={handleBuyAllCourses}
              >
                {enrollMultipleMutation.isPending ? "Enrolling..." : "Buy All 15 Courses"}
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 mt-8">
              {levelOrder.map((level) => {
                const levelCourses = coursesByLevel[level];
                if (!levelCourses || levelCourses.length === 0) return null;

                const isCertificate = level === 'certificate';
                const levelTotal = levelCourses.reduce((sum, c) => sum + Number(c.price || 0), 0);

                return (
                  <div key={level} className="bg-card rounded-2xl border border-border overflow-hidden">
                    {/* Level Header */}
                    <div className={`px-6 py-4 ${
                      level === 'certificate' ? 'bg-orange/10' : 
                      level === 'operational' ? 'bg-primary/10' : 
                      level === 'management' ? 'bg-purple/10' : 
                      'bg-red/10'
                    } border-b border-border`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{levelNames[level]}</h3>
                          <p className="text-sm text-muted-foreground">
                            {levelCourses.length} {levelCourses.length === 1 ? 'exam' : 'exams'}
                          </p>
                        </div>
                        {!isCertificate && (
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground line-through">
                                £{levelTotal} individually
                              </div>
                              <div className={`text-lg font-bold ${
                                level === 'operational' ? 'text-primary' : 
                                level === 'management' ? 'text-purple' : 
                                'text-red'
                              }`}>
                                £449 as bundle
                              </div>
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              className={`${
                                level === 'operational' ? 'bg-primary hover:bg-primary/90' : 
                                level === 'management' ? 'bg-purple hover:bg-purple/90' : 
                                'bg-red hover:bg-red/90'
                              } text-white`}
                              disabled={enrollMultipleMutation.isPending}
                              onClick={() => handleBuyLevelBundle(level, levelCourses)}
                            >
                              {enrollMultipleMutation.isPending ? "Enrolling..." : "Buy Level Bundle"}
                            </Button>
                          </div>
                        )}
                        {isCertificate && (
                          <span className="px-3 py-1 rounded-full bg-orange text-white text-sm font-medium">
                            Free
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Course List */}
                    <div className="divide-y divide-border">
                      {levelCourses.map((course) => {
                        const enrolled = isEnrolled(course.id);
                        const isFree = Number(course.price) === 0;

                        return (
                          <div key={course.id} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{course.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {course.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                              <span className={`text-lg font-bold ${
                                isFree ? 'text-orange' : 'text-foreground'
                              }`}>
                                {isFree ? 'Free' : `£${Number(course.price).toFixed(0)}`}
                              </span>
                              <Button
                                size="sm"
                                variant={enrolled ? "outline" : isFree ? "default" : "secondary"}
                                disabled={enrollMutation.isPending}
                                onClick={() => handleEnroll(course.id, course.title)}
                              >
                                {enrolled ? "Enrolled" : isFree ? "Start Free" : "Enroll"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Cards */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bundle Plans
            </h2>
            <p className="text-lg text-muted-foreground">
              Save more with our comprehensive bundle plans.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-card rounded-2xl border ${
                  plan.popular ? "border-primary shadow-glow" : "border-border"
                } p-8 hover-lift`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-foreground">£{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="line-through">£{plan.originalPrice}</span>
                      <span className="ml-2 text-primary font-medium">
                        Save £{plan.originalPrice - plan.price}
                      </span>
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Money Back Guarantee */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">30-day money-back guarantee on all plans</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              CIMAStudy vs Kaplan
            </h2>
            <p className="text-lg text-muted-foreground">
              See how we compare to the traditional CIMA providers
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-secondary/50">
                <div className="p-4 font-semibold text-foreground">Feature</div>
                <div className="p-4 text-center font-semibold text-primary">CIMAStudy</div>
                <div className="p-4 text-center font-semibold text-muted-foreground">Kaplan</div>
              </div>

              {/* Rows */}
              {comparison.map((row, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-3 ${index % 2 === 0 ? "bg-background" : "bg-secondary/20"}`}
                >
                  <div className="p-4 text-foreground">{row.feature}</div>
                  <div className="p-4 flex justify-center">
                    {row.us === true ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <span className="text-muted-foreground">{row.us}</span>
                    )}
                  </div>
                  <div className="p-4 flex justify-center">
                    {row.kaplan === true ? (
                      <CheckCircle className="w-5 h-5 text-muted-foreground" />
                    ) : row.kaplan === false ? (
                      <X className="w-5 h-5 text-muted-foreground/50" />
                    ) : (
                      <span className="text-sm text-muted-foreground">{row.kaplan}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of successful CIMA students who chose the modern way to study.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <Button size="lg" className="gap-2">
                <Zap className="w-5 h-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;
