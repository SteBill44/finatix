import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Zap, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses, useEnrollments, useEnrollInCourse, useEnrollInMultipleCourses } from "@/hooks/useStudentProgress";
import { useHasCIMAProfile } from "@/hooks/useCIMAProfile";
import CIMAProfileModal from "@/components/CIMAProfileModal";
import { toast } from "sonner";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import useSubscription from "@/hooks/useSubscription";
import {
  PLAN_PRODUCTS,
  COMPLETE_BUNDLE,
  POLICY,
  LEVEL_BUNDLE_PRICE,
  LEVEL_NAMES,
  getCoursePriceId,
  getLevelBundlePriceId,
  billingSummary,
  formatPrice,
  type CatalogueProduct,
} from "@/lib/catalogue";

const AnimatedCard = ({ 
  children, 
  index, 
  className = "" 
}: { 
  children: React.ReactNode; 
  index: number; 
  className?: string;
}) => {
  const { isVisible, elementRef } = useScrollAnimation({ threshold: 0.1 });
  
  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {children}
    </div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: courses } = useCourses();
  const { data: enrollments } = useEnrollments();
  const enrollMutation = useEnrollInCourse();
  const enrollMultipleMutation = useEnrollInMultipleCourses();
  const { hasCompleteProfile, isLoading: isLoadingProfile } = useHasCIMAProfile();
  const { isActive: hasMembership } = useSubscription();
  const [showCIMAModal, setShowCIMAModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  // Everything paid goes through the dedicated checkout page
  const goToCheckout = (item: {
    priceId: string;
    title: string;
    price: number;
    courseId?: string;
    courseIds?: string[];
    bundleLabel?: string;
  }) => {
    const q = new URLSearchParams({ priceId: item.priceId, title: item.title, price: String(item.price) });
    if (item.courseId) q.set("courseId", item.courseId);
    if (item.courseIds?.length) q.set("courses", item.courseIds.join(","));
    if (item.bundleLabel) q.set("bundle", item.bundleLabel);
    navigate(`/checkout/pay?${q.toString()}`);
  };

  const isEnrolled = (courseId: string) => {
    return enrollments?.some((e) => e.course_id === courseId);
  };

  const checkCIMAAndExecute = async (action: () => Promise<void>) => {
    if (!hasCompleteProfile && !isLoadingProfile) {
      setPendingAction(() => action);
      setShowCIMAModal(true);
      return;
    }
    await action();
  };

  const handleEnroll = async (
    courseId: string,
    courseName: string,
    courseSlug?: string,
    coursePrice?: number,
  ) => {
    if (user && isEnrolled(courseId)) {
      toast.info("You're already enrolled in this course");
      navigate("/dashboard");
      return;
    }

    // Paid courses go straight to payment - no sign-in needed
    const priceId = getCoursePriceId(courseSlug);
    if (priceId && (coursePrice ?? 0) > 0 && !hasMembership) {
      goToCheckout({
        priceId,
        title: `Buy ${courseName}`,
        price: coursePrice ?? 0,
        courseId,
      });
      return;
    }

    if (!user) {
      toast.error("Please sign in to start this course");
      navigate("/auth");
      return;
    }

    await checkCIMAAndExecute(async () => {
      try {
        await enrollMutation.mutateAsync(courseId);
        toast.success(`Successfully enrolled in ${courseName}!`);
        navigate("/dashboard");
      } catch (error: any) {
        toast.error(error.message || "Failed to enroll");
      }
    });
  };

  const openBundleCheckout = (
    priceId: string | undefined,
    label: string,
    bundleCourses: typeof courses,
    price: number,
  ) => {
    if (!priceId) {
      toast.error("This bundle isn't on sale at the moment");
      return;
    }
    if (!bundleCourses || bundleCourses.length === 0) {
      toast.error("No courses found for this bundle");
      return;
    }
    goToCheckout({
      priceId,
      title: `Buy ${label}`,
      bundleLabel: label,
      price,
      courseIds: bundleCourses.map((c) => c.id),
    });
  };

  const handleBuyLevelBundle = (level: string, levelCourses: typeof courses) => {
    openBundleCheckout(
      getLevelBundlePriceId(level),
      `${LEVEL_NAMES[level] ?? level} Bundle`,
      levelCourses,
      LEVEL_BUNDLE_PRICE,
    );
  };

  const handleBuyAllCourses = () => {
    openBundleCheckout(
      COMPLETE_BUNDLE.priceId ?? undefined,
      COMPLETE_BUNDLE.name,
      courses,
      COMPLETE_BUNDLE.price ?? allCoursesBundlePrice,
    );
  };

  // Each plan button must open exactly the product on its own card - never a
  // different plan or billing period.
  const handlePlanCta = (product: CatalogueProduct) => {
    if (product.id === "single_module") {
      document.getElementById("individual-courses")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (product.id === "complete_bundle") {
      handleBuyAllCourses();
      return;
    }
    if (!product.priceId || product.price == null) {
      toast.error("This plan isn't on sale at the moment");
      return;
    }
    goToCheckout({
      priceId: product.priceId,
      title: product.name,
      price: product.price,
    });
  };





  const handleCIMAModalSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Group courses by level
  const coursesByLevel = courses?.reduce((acc, course) => {
    const level = course.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(course);
    return acc;
  }, {} as Record<string, typeof courses>);

  // Calculate total price of all courses dynamically
  const totalAllCoursesPrice = courses?.reduce((sum, c) => sum + Number(c.price || 0), 0) || 0;
  const allCoursesBundlePrice = 999;
  const allCoursesSavings = totalAllCoursesPrice - allCoursesBundlePrice;
  const allCoursesCount = courses?.length || 0;

  const levelOrder = ['certificate', 'operational', 'management', 'strategic'];

  // Every plan card is built from the shared catalogue, so what a card says
  // and what its button buys can never drift apart.
  const planExtras: Record<string, { cta: string; popular?: boolean; subtitle?: string; periodLabel: string }> = {
    single_module: { cta: "Choose your module", periodLabel: "per module" },
    membership_monthly: { cta: "Start Monthly", popular: true, subtitle: "Cancel anytime", periodLabel: "per month" },
    complete_bundle: { cta: "Get Lifetime Access", subtitle: "Lifetime access - best value", periodLabel: "one-time payment" },
  };

  const plans = PLAN_PRODUCTS.map((product) => ({
    product,
    ...planExtras[product.id],
    originalPrice: product.id === "complete_bundle" ? (totalAllCoursesPrice || 2388) : undefined,
  }));

  // We previously compared ourselves feature-by-feature against a named
  // competitor without evidence for that competitor's current product. Until
  // dated evidence exists for a named comparable product (see
  // OPEN_CLAIM_DECISIONS in src/lib/claims.ts), we describe only what we do.
  const included = [
    {
      feature: "Lessons written to the CIMA syllabus areas for each paper",
      detail: `${PLATFORM_FACTS.lessons} lessons across ${PLATFORM_FACTS.courses} courses`,
    },
    {
      feature: "Practice questions marked automatically",
      detail: `${PLATFORM_FACTS.practiceQuestions} questions with per-question explanations`,
    },
    {
      feature: "Timed mock exams",
      detail: "Included with every course, retakeable as often as you like",
    },
    {
      feature: "Competency tracking and weak-area analysis",
      detail: "Readiness scoring by syllabus area",
    },
    {
      feature: "Spaced-repetition flashcards and discussions",
      detail: "Included with every course",
    },
    {
      feature: "Access on phone, tablet and desktop",
      detail: "One account, no separate app purchase",
    },
    {
      feature: "Finatix certificate of completion",
      detail: "Not a CIMA qualification or exam result",
    },
    {
      feature: "Support",
      detail: POLICY.standardSupport,
    },
    {
      feature: "Refunds",
      detail: POLICY.refundText,
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Pricing | Affordable CIMA Training"
        description="Affordable CIMA training packages. Choose individual modules, full level bundles, or unlimited lifetime access. Competitive pricing with flexible payment options."
        keywords="CIMA pricing, CIMA course fees, CIMA training cost, affordable CIMA courses, CIMA subscription"
        canonicalUrl="https://finatix.io/pricing"
      />
      {/* Hero */}
      <section className="relative pt-32 lg:pt-36 pb-16 lg:pb-20 hero-gradient-light overflow-hidden">
        <div className="gradient-orb gradient-orb-primary w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] -top-20 -left-10 pointer-events-none" />
        <div className="gradient-orb gradient-orb-accent w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] top-1/3 -right-20 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 uppercase">
            INVEST IN YOUR <span className="text-gradient-brand">CIMA SUCCESS</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Choose the plan that fits your goals. All plans include our modern analytics and learning tools.
          </p>
        </div>
        
      </section>

      {/* Pricing Cards */}
      <section className="py-8 lg:py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bundle Plans
            </h2>
            <p className="text-lg text-muted-foreground">
              Save more with our comprehensive bundle plans. The price you see is the price you pay.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto">
            {plans.map(({ product, cta, popular, subtitle, periodLabel, originalPrice }, index) => (
              <AnimatedCard key={product.id} index={index}>
                <div
                  className={`relative bg-card rounded-2xl border ${
                    popular ? "border-primary shadow-glow" : "border-border"
                  } p-5 lg:p-6 hover-lift h-full flex flex-col`}
                >
                  {popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-foreground">
                        {product.price != null ? formatPrice(product.price) : "-"}
                      </span>
                      <span className="text-sm text-muted-foreground">/{periodLabel}</span>
                    </div>
                    {originalPrice && product.price != null && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="line-through">{formatPrice(originalPrice)}</span>
                        <span className="ml-2 text-primary font-medium">
                          Save {formatPrice(originalPrice - product.price)}
                        </span>
                      </p>
                    )}
                    {subtitle && (
                      <p className="mt-2 text-sm font-medium text-primary">{subtitle}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{billingSummary(product)}</p>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {product.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={popular ? "default" : "outline"}
                    size="lg"
                    className="w-full mt-auto"
                    onClick={() => handlePlanCta(product)}
                  >
                    {cta}
                  </Button>
                </div>
              </AnimatedCard>
            ))}
          </div>

          {/* Money Back Guarantee */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">{POLICY.refundText}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Courses by Level */}
      <div id="individual-courses" />
      {coursesByLevel && Object.keys(coursesByLevel).length > 0 && (
        <section className="py-8 lg:py-10 bg-secondary/30">
          <div className="container mx-auto px-4 overflow-hidden">
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
            
            {/* Buy All Courses Banner */}
            {totalAllCoursesPrice > 0 && (
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 bg-gradient-to-r from-primary/20 via-purple/20 to-red/20 rounded-2xl border border-primary/30">
                <div className="text-center sm:text-left">
                  <p className="text-lg font-bold text-foreground">Complete CIMA Bundle - All {allCoursesCount} Courses</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="line-through">£{totalAllCoursesPrice.toLocaleString()}</span>
                    <span className="ml-2 text-primary font-semibold">£{allCoursesBundlePrice.toLocaleString()} lifetime access</span>
                    <span className="ml-2 text-primary">Save £{allCoursesSavings.toLocaleString()}!</span>
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple hover:opacity-90 text-white shrink-0"
                  onClick={handleBuyAllCourses}
                >
                  {`Buy All ${allCoursesCount} Courses`}
                </Button>
              </div>
            )}
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
                    <div className={`px-4 sm:px-6 py-4 ${
                      level === 'certificate' ? 'bg-orange/10' : 
                      level === 'operational' ? 'bg-primary/10' : 
                      level === 'management' ? 'bg-purple/10' : 
                      'bg-red/10'
                    } border-b border-border`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{LEVEL_NAMES[level]}</h3>
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
                                {formatPrice(LEVEL_BUNDLE_PRICE)} as bundle
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Save {formatPrice(levelTotal - LEVEL_BUNDLE_PRICE)}
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
                              onClick={() => handleBuyLevelBundle(level, levelCourses)}
                            >
                              Buy Level Bundle
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
                          <div key={course.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/30 transition-colors">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">{course.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {course.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 sm:ml-4">
                              <span className={`text-lg font-bold ${
                                isFree ? 'text-orange' : 'text-foreground'
                              }`}>
                                {isFree ? 'Free' : `£${Number(course.price).toFixed(0)}`}
                              </span>
                              <Button
                                size="sm"
                                variant={enrolled ? "outline" : isFree ? "default" : "secondary"}
                                disabled={enrollMutation.isPending}
                                onClick={() => handleEnroll(course.id, course.title, course.slug, Number(course.price))}
                              >
                                {enrolled ? "Enrolled" : isFree ? "Start Free" : "Buy"}
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

      {/* Comparison Section */}
      <section className="py-8 lg:py-10 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Finatix vs Kaplan
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
                <div className="p-4 text-center font-semibold text-primary">Finatix</div>
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
                      <X className="w-5 h-5 text-muted-foreground" />
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
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Study for your CIMA exams with structured courses, practice questions and progress tracking.
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

      <CIMAProfileModal
        open={showCIMAModal}
        onClose={() => {
          setShowCIMAModal(false);
          setPendingAction(null);
        }}
        onSuccess={handleCIMAModalSuccess}
      />

    </Layout>
  );
};

export default Pricing;
