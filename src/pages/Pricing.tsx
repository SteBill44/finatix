import { usePlatformFacts } from "@/hooks/usePlatformFacts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCourseContentStatus } from "@/hooks/useCourseContentStatus";
import InterestRegistrationForm from "@/components/InterestRegistrationForm";
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
import { PLATFORM_FACTS } from "@/lib/company";
import { QualificationDisclosure } from "@/components/credibility/QualificationDisclosure";
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

  const { data: contentStatusMap } = useCourseContentStatus();
  const facts = usePlatformFacts();
  const [interestFor, setInterestFor] = useState<{ name: string; courseId?: string } | null>(null);
  const paidStatuses = contentStatusMap ? [...contentStatusMap.values()].filter((r) => !r.is_free) : [];
  const anyPaidOnSale = paidStatuses.some((r) => r.on_sale);
  // Mirror of the server rule: every paid course in the item must be on sale.
  const itemOnSale = (item: { courseId?: string; courseIds?: string[] }) => {
    if (!contentStatusMap) return false;
    const ids = item.courseId ? [item.courseId] : item.courseIds;
    const scope = ids?.length
      ? ids.map((id) => contentStatusMap.get(id)).filter((r) => r && !r.is_free)
      : paidStatuses;
    return scope.length > 0 && scope.every((r) => r!.on_sale);
  };

  // Everything paid goes through the dedicated checkout page
  const goToCheckout = (item: {
    priceId: string;
    title: string;
    price: number;
    courseId?: string;
    courseIds?: string[];
    bundleLabel?: string;
  }) => {
    if (!itemOnSale(item)) {
      setInterestFor({ name: item.bundleLabel || item.title.replace(/^Buy /, ""), courseId: item.courseId });
      return;
    }
    const q = new URLSearchParams({ priceId: item.priceId, title: item.title });
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
    { feature: "Course access", detail: "Single-exam or bundle purchases provide lifetime access to the included courses. Membership access lasts while your subscription is active." },
    { feature: "Study workspace", detail: "Syllabus-organised lessons, personal notes, flashcards and saved course progress." },
    { feature: "Practice and results", detail: "Automatically marked questions with explanations and results saved to your account. See each exam for its resources." },
    { feature: "Refunds", detail: POLICY.refundText },
    { feature: "Support", detail: POLICY.standardSupport },
    { feature: "CIMA fees", detail: "Registration, student subscription and exam fees are separate, payable to AICPA & CIMA." },
  ];

  return (
    <Layout>
      <SEOHead
        title="Pricing | Affordable CIMA Training"
        description="Affordable CIMA training packages. Choose individual modules, full level bundles, or unlimited lifetime access. Competitive pricing with flexible payment options."
        keywords="CIMA pricing, CIMA course fees, CIMA training cost, affordable CIMA courses, CIMA subscription"
        canonicalUrl="https://finatix.io/pricing"
      />
      <section className="public-hero"><div className="container px-5 md:px-8"><p className="eyebrow">Access & pricing</p><h1 className="public-title">Study your way.<br /><span className="text-primary">Choose your access.</span></h1><p className="mt-5 max-w-xl text-lg text-muted-foreground">One exam, a level or the full qualification. Choose the option that fits your CIMA study.</p><p className="mt-3 text-sm text-muted-foreground">Certificate courses are free with an account. Prices include VAT; CIMA exam fees are separate.</p></div></section>
      <section className="section-space"><div className="container px-5 md:px-8">
        <div className="grid gap-5 lg:grid-cols-3">{plans.map(({ product, cta, periodLabel }) => {
          const open = product.id === "single_module" || itemOnSale({});
          return <div key={product.id} className="flex flex-col rounded-md border border-border bg-card p-7">
            <p className="eyebrow">{product.billingType === "subscription" ? "Flexible access" : "Lifetime course access"}</p><h2 className="text-2xl font-medium">{product.name}</h2><p className="mt-3 text-sm text-muted-foreground">{product.description}</p>
            <div className="my-7"><span className="font-display text-4xl font-medium">{product.price != null ? formatPrice(product.price) : "—"}</span><span className="ml-2 text-sm text-muted-foreground">/{periodLabel}</span><p className="mt-2 text-xs text-muted-foreground">{open ? billingSummary(product) : "Indicative price. No charge when registering interest."}</p></div>
            <ul className="mb-8 flex-1 space-y-3">{product.features.map((feature, i) => <li key={i} className="flex items-start gap-3 text-sm">{feature.included ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}<span className={feature.included ? "text-foreground" : "text-muted-foreground"}>{feature.text}</span></li>)}</ul>
            <Button trace variant={product.id === "membership_monthly" ? "default" : "outline"} size="lg" onClick={() => handlePlanCta(product)}>{product.id === "single_module" ? "Choose an exam" : open ? cta : "Register interest"}</Button>
          </div>;
        })}</div>
        {contentStatusMap && !anyPaidOnSale && <p role="note" className="mt-6 border-l-2 border-primary pl-4 text-sm text-muted-foreground">Paid purchasing is currently unavailable. You can view access options and register interest without payment. Existing purchases keep their access.</p>}
      </div></section>
      <section id="individual-courses" className="section-space scroll-mt-24 border-y border-border bg-secondary/30"><div className="container px-5 md:px-8"><div className="mb-10"><p className="eyebrow">Exam by exam</p><h2 className="section-title">Choose what you need.</h2><p className="mt-4 text-muted-foreground">Every exam follows the same qualification structure.</p></div>
        {coursesByLevel && levelOrder.map((level) => {
          const levelCourses = coursesByLevel[level]; if (!levelCourses?.length) return null;
          const paid = level !== "certificate";
          const onSale = itemOnSale({ courseIds: levelCourses.map((course) => course.id) });
          return <div key={level} className="mb-10 last:mb-0"><div className="mb-2 flex flex-col justify-between gap-4 border-t border-foreground py-5 sm:flex-row sm:items-center"><h3 className="text-2xl font-medium">{LEVEL_NAMES[level]}</h3>{paid && <div className="flex items-center gap-4"><span className="text-sm text-muted-foreground">Level bundle {formatPrice(LEVEL_BUNDLE_PRICE)}</span><Button trace variant="outline" size="sm" onClick={() => handleBuyLevelBundle(level, levelCourses)}>{onSale ? "Buy level bundle" : "Register interest"}</Button></div>}</div>
            <div className="divide-y divide-border">{levelCourses.map((course) => { const enrolled = isEnrolled(course.id); const free = Number(course.price) === 0; const ready = itemOnSale({ courseId: course.id });
              return <div key={course.id} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"><Link to={`/courses/${course.slug}`} className="min-w-0 flex-1 font-medium hover:text-primary">{course.title}</Link><div className="flex items-center gap-4"><span className="w-16 text-sm font-semibold">{free ? "Free" : formatPrice(Number(course.price))}</span><Button size="sm" variant={free ? "default" : "outline"} disabled={enrollMutation.isPending} onClick={() => handleEnroll(course.id, course.title, course.slug, Number(course.price))}>{enrolled ? "Enrolled" : free ? "Start free" : ready || hasMembership ? "Access exam" : "Register interest"}</Button></div></div>;
            })}</div>
          </div>;
        })}
      </div></section>
      <section className="section-space"><div className="container grid gap-10 px-5 md:px-8 lg:grid-cols-[1fr_1.3fr]"><div><p className="eyebrow">The details</p><h2 className="section-title">Clear from<br />the beginning.</h2><div className="mt-6"><QualificationDisclosure compact /></div></div><dl className="divide-y divide-border border-y border-border">{included.map((row) => <div key={row.feature} className="grid gap-2 py-5 sm:grid-cols-[140px_1fr]"><dt className="text-sm font-semibold">{row.feature}</dt><dd className="text-sm text-muted-foreground">{row.detail}</dd></div>)}</dl></div></section>

      <CIMAProfileModal
        open={showCIMAModal}
        onClose={() => {
          setShowCIMAModal(false);
          setPendingAction(null);
        }}
        onSuccess={handleCIMAModalSuccess}
      />

    <Dialog open={!!interestFor} onOpenChange={(o) => !o && setInterestFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not open for purchase yet</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {interestFor?.name} is not currently open for purchase. Nothing is charged. Register interest if you would like to hear when access is available.
          </p>
          <InterestRegistrationForm courseId={interestFor?.courseId ?? null} courseName={interestFor?.name ?? "this option"} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Pricing;
