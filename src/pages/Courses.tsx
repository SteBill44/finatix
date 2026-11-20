import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import JsonLd from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { queries } from "@/lib/api";
import { CourseGridSkeleton } from "@/components/skeletons/ContentSkeletons";
import {
  Search,
  Clock,
  BookOpen,
  BarChart3,
  Target,
  ArrowRight,
  Award,
  CheckCircle2,
  LayoutGrid,
  List,
  GraduationCap,
  FileText,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAdminView } from "@/contexts/AdminViewContext";
import { useQueryClient } from "@tanstack/react-query";
import AdminImageDropZone from "@/components/admin/AdminImageDropZone";
import { OptimizedImage } from "@/components/OptimizedImage";
import CourseCover from "@/components/course/CourseCover";
import { ContentStatusBadge } from "@/components/course/ContentStatusNotice";
import { useCourseContentStatus, canPurchase } from "@/hooks/useCourseContentStatus";
import { useEnrollments, useLessonProgress } from "@/hooks/useStudentProgress";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
  id: string;
  slug: string;
  title: string;
  level: string;
  description: string | null;
  price: number;
  duration_hours: number | null;
  image_url: string | null;
}

// ── Level config ──────────────────────────────────────────────────
const levelConfig = {
  certificate: { label: "Certificate", icon: Award, sub: "BA1 · BA2 · BA3 · BA4" },
  operational: { label: "Operational", icon: BookOpen, sub: "E1 · P1 · F1 · OCS" },
  management: { label: "Management", icon: BarChart3, sub: "E2 · P2 · F2 · MCS" },
  strategic: { label: "Strategic", icon: Target, sub: "E3 · P3 · F3 · SCS" },
} as const;

type Level = keyof typeof levelConfig;
const levelOrder: Level[] = ["certificate", "operational", "management", "strategic"];

// ── Helpers ───────────────────────────────────────────────────────
const getCourseOrder = (slug: string) => {
  const code = slug.split("-")[0].toLowerCase();
  if (code.startsWith("ba")) return parseInt(code.replace("ba", ""));
  if (code.startsWith("e")) return 1;
  if (code.startsWith("p")) return 2;
  if (code.startsWith("f")) return 3;
  if (["ocs","mcs","scs"].includes(code)) return 4;
  return 5;
};
const getCourseCode = (slug: string) => slug.split("-")[0].toUpperCase();
const isCaseStudy = (slug: string) => slug.includes("case-study");

// ── Card Components ───────────────────────────────────────────────

interface CardProps {
  course: Course;
  isEffectiveAdmin: boolean;
  isEnrolled: boolean;
  isCompleted: boolean;
  completedLessons: number;
  totalLessons: number;
  onImageUpdate: (url: string) => void;
  view: "grid" | "list";
}

function CourseCard({
  course, isEffectiveAdmin, isEnrolled, isCompleted,
  completedLessons, totalLessons, onImageUpdate, view,
}: CardProps) {
  const code = getCourseCode(course.slug);
  const { data: statusMap } = useCourseContentStatus();
  const status = statusMap?.get(course.id);
  const unopened = course.price > 0 && !canPurchase(status);
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const priceNode = course.price === 0 ? "Free" : unopened ? "View access options" : `£${course.price}`;
  return <AdminImageDropZone onImageUpdated={onImageUpdate}>
    <Link to={`/courses/${course.slug}`} className={`exam-card group ${view === "list" ? "exam-card-list" : ""}`}>
      {view === "grid" ? <div className="aspect-[16/7] overflow-hidden border-b border-border">{course.image_url ? <OptimizedImage src={course.image_url} alt={course.title} className="h-full w-full object-cover" /> : <CourseCover level={course.level} code={code} className="h-full w-full" />}</div> : <span className="exam-code">{code}</span>}
      <div className={`min-w-0 flex-1 ${view === "grid" ? "p-5" : ""}`}>
        <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{code}</span>{isCompleted ? <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" />Completed</span> : isEnrolled ? <span className="text-primary">Enrolled</span> : null}</div>
        <h3 className="text-base font-medium leading-snug text-foreground">{course.title}</h3>
        {course.description && <p className={`mt-2 text-sm text-muted-foreground ${view === "grid" ? "line-clamp-2" : "line-clamp-1"}`}>{course.description}</p>}
        {isEnrolled && totalLessons > 0 && <div className="mt-4"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{completedLessons}/{totalLessons} lessons</span><span>{progressPct}%</span></div><Progress value={progressPct} className="h-1" /></div>}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4"><span className={`text-xs font-semibold ${course.price === 0 ? "text-primary" : "text-muted-foreground"}`}>{priceNode}</span><ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" /></div>
      </div>
    </Link>
  </AdminImageDropZone>;
}

// ── Page ──────────────────────────────────────────────────────────
const Courses = () => {
  // Filters live in the address bar so /courses?level=management&q=ratio links,
  // refresh and the back button all restore the same view.
  const [params, setParams] = useSearchParams();
  const LEVELS = ["certificate", "operational", "management", "strategic"];
  const levelParam = params.get("level") ?? "all";
  const selectedLevel = LEVELS.includes(levelParam) ? levelParam : "all";
  const caseStudyOnly = params.get("case") === "1";
  const priceParam = params.get("price");
  const priceFilter: "all" | "free" | "paid" = priceParam === "free" || priceParam === "paid" ? priceParam : "all";
  const sortParam = params.get("sort");
  const sortBy: "default" | "title" | "price-asc" | "price-desc" =
    sortParam === "title" || sortParam === "price-asc" || sortParam === "price-desc" ? sortParam : "default";
  const qParam = params.get("q") ?? "";
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(qParam);
  const updateParam = (key: string, value: string | null, replace = false) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null || value === "") next.delete(key); else next.set(key, value);
      return next;
    }, { replace });
  };
  const setSelectedLevel = (v: string) => updateParam("level", v === "all" ? null : v);
  const setCaseStudyOnly = (v: boolean | ((prev: boolean) => boolean)) => {
    const val = typeof v === "function" ? v(caseStudyOnly) : v;
    updateParam("case", val ? "1" : null);
  };
  const setPriceFilter = (v: "all" | "free" | "paid") => updateParam("price", v === "all" ? null : v);
  const setSortBy = (v: string) => updateParam("sort", v === "default" ? null : v);
  // Back/forward navigation changes the URL: bring the search box along.
  useEffect(() => {
    setSearchTerm(qParam);
    setDebouncedSearchTerm(qParam);
  }, [qParam]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { isStudentView } = useAdminView();
  const queryClient = useQueryClient();
  const isEffectiveAdmin = isAdmin && !isStudentView;

  const { data: courses = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await queries.getCoursesForCatalog();
      if (error) throw error;
      return (data || []) as Course[];
    },
  });

  // Lesson counts per course (total)
  const { data: lessonCountMap = {} } = useQuery({
    queryKey: ["lesson_counts"],
    queryFn: async () => {
      const { data, error } = await queries.getLessonCountsByCourse();
      if (error) return {} as Record<string, number>;
      return data || {};
    },
  });

  // Enrollment data
  const { data: enrollments = [] } = useEnrollments();
  const { isActive: hasMembership } = useSubscription();
  const enrolledMap = useMemo(
    () => Object.fromEntries(enrollments.map((e) => [e.course_id, e])),
    [enrollments]
  );

  // Completed lessons per course
  const { data: allProgress = [] } = useLessonProgress();
  const completedPerCourse = useMemo(() => {
    const map: Record<string, number> = {};
    (allProgress as Array<{ completed: boolean; lessons: { course_id: string } | null }>).forEach((p) => {
      if (p.completed && p.lessons?.course_id) {
        const cid = p.lessons.course_id;
        map[cid] = (map[cid] || 0) + 1;
      }
    });
    return map;
  }, [allProgress]);

  const handleCourseImageUpdate = async (courseId: string, newUrl: string) => {
    await supabase.from("courses").update({ image_url: newUrl }).eq("id", courseId);
    queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  // Debounce search input so typing doesn't re-filter on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== qParam) updateParam("q", searchTerm.trim() || null, true);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredCourses = useMemo(
    () =>
      [...courses]
        .filter((course) => {
          const q = debouncedSearchTerm.toLowerCase();
          const matchesSearch =
            course.title.toLowerCase().includes(q) ||
            course.slug.toLowerCase().includes(q) ||
            (course.description || "").toLowerCase().includes(q);
          const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
          const matchesCaseStudy = !caseStudyOnly || isCaseStudy(course.slug);
          const matchesPrice =
            priceFilter === "all" ||
            (priceFilter === "free" ? course.price === 0 : course.price > 0);
          return matchesSearch && matchesLevel && matchesCaseStudy && matchesPrice;
        })
        .sort((a, b) => {
          if (sortBy === "title") return a.title.localeCompare(b.title);
          if (sortBy === "price-asc") return a.price - b.price;
          if (sortBy === "price-desc") return b.price - a.price;
          return getCourseOrder(a.slug) - getCourseOrder(b.slug);
        }),
    [courses, debouncedSearchTerm, selectedLevel, caseStudyOnly, priceFilter, sortBy]
  );

  const groupedCourses = useMemo(
    () => Object.fromEntries(levelOrder.map((level) => [level, filteredCourses.filter((c) => c.level === level)])),
    [filteredCourses]
  );

  return (
    <Layout>
      <SEOHead
        title="CIMA Exam Catalogue"
        description="Browse Finatix CIMA courses across Certificate, Operational, Management and Strategic levels, including case studies. See what each course contains today before you enrol."
        keywords="CIMA courses, BA1, BA2, BA3, BA4, E1, P1, F1, E2, P2, F2, E3, P3, F3, case study, CIMA online training"
        canonicalUrl="/courses"
      />
      <JsonLd
        id="courses-itemlist-jsonld"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "CIMA Courses",
          url: "https://finatix.io/courses",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: courses.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://finatix.io/courses/${c.slug}`,
              name: c.title,
            })),
          },
        }}
      />

      <section className="public-hero"><div className="container px-5 md:px-8"><p className="eyebrow">The exam catalogue</p><h1 className="public-title">Every CIMA exam.<br /><span className="text-primary">One place.</span></h1><p className="mt-5 max-w-xl text-lg text-muted-foreground">All sixteen exams across four qualification levels. Find the exam you're studying and open its learning resources.</p></div></section>
      <section className="border-b border-border bg-card"><div className="container px-5 md:px-8"><div className="grid grid-cols-2 gap-2 py-5 sm:grid-cols-5">
        <Button variant={selectedLevel === "all" ? "secondary" : "ghost"} onClick={() => setSelectedLevel("all")} aria-pressed={selectedLevel === "all"}>All levels</Button>
        {levelOrder.map((level) => <Button key={level} variant={selectedLevel === level ? "secondary" : "ghost"} className={selectedLevel === level ? "text-primary" : "text-muted-foreground"} aria-pressed={selectedLevel === level} onClick={() => setSelectedLevel(selectedLevel === level ? "all" : level)}>{levelConfig[level].label}</Button>)}
      </div></div></section>

      {/* ── Filters + Courses ── */}
      <section className="py-8 lg:py-10">
        <div className="container mx-auto px-5 md:px-8">
          {hasMembership && (
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">
                Your membership includes every course
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You still need to enrol in a course to start it. Pick the one you want to begin with -
                you can enrol in the others any time.
              </p>
            </div>
          )}
          {/* Filter bar */}
          <div className="flex flex-col lg:flex-row gap-3 mb-6 items-start lg:items-center">
            <div className="relative flex-1 max-w-md w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                aria-label="Search courses"
                placeholder="Search by exam code or subject"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-md"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {caseStudyOnly && <Button variant="secondary" onClick={() => setCaseStudyOnly(false)}><X className="h-3 w-3" />Exam type filter</Button>}

              {/* Price filter */}
              <Select value={priceFilter} onValueChange={(v) => setPriceFilter(v as typeof priceFilter)}>
                <SelectTrigger className="h-10 w-[110px] rounded-md text-xs">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="h-10 w-[130px] rounded-md text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="price-asc">Price: low-high</SelectItem>
                  <SelectItem value="price-desc">Price: high-low</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear filters */}
              {(debouncedSearchTerm || selectedLevel !== "all" || caseStudyOnly || priceFilter !== "all" || sortBy !== "default") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setSelectedLevel("all");
                    setCaseStudyOnly(false);
                    setPriceFilter("all");
                    setSortBy("default");
                  }}
                  className="h-10 px-3 text-xs"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Clear
                </Button>
              )}

              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg flex-shrink-0">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Enrolled info chip */}
            {user && enrollments.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-md flex-shrink-0">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                {enrollments.length} enrolled
              </span>
            )}
          </div>

          {isLoading && <CourseGridSkeleton count={8} />}
          {isError && (
            <div role="alert" className="text-center py-12 space-y-3">
              <p className="text-foreground font-medium">We couldn't load the courses.</p>
              <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
              <Button onClick={() => refetch()}>Try again</Button>
            </div>
          )}

          {!isLoading && levelOrder.map((level) => {
            const levelCourses = groupedCourses[level] || [];
            if (levelCourses.length === 0) return null;
            const cfg = levelConfig[level];
            const Icon = cfg.icon;

            return (
              <div key={level} className="mb-14 last:mb-0">
                <div className="mb-6 flex items-end justify-between gap-3 border-t border-foreground pt-5"><div><h2 className="text-2xl font-medium text-foreground">{cfg.label}</h2><p className="mt-1 text-xs text-muted-foreground">{cfg.sub}</p></div><span className="text-xs text-muted-foreground">{levelCourses.length} exams</span></div>

                {/* Mobile: always list view */}
                <div className="space-y-2.5 sm:hidden">
                  {levelCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isEffectiveAdmin={isEffectiveAdmin}
                      isEnrolled={!!enrolledMap[course.id]}
                      isCompleted={!!enrolledMap[course.id]?.completed_at}
                      completedLessons={completedPerCourse[course.id] || 0}
                      totalLessons={lessonCountMap[course.id] || 0}
                      onImageUpdate={(url) => handleCourseImageUpdate(course.id, url)}
                      view="list"
                    />
                  ))}
                </div>

                {/* Desktop: respect grid/list toggle */}
                <div className="hidden sm:block">
                  {view === "grid" ? (
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                      {levelCourses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          isEffectiveAdmin={isEffectiveAdmin}
                          isEnrolled={!!enrolledMap[course.id]}
                          isCompleted={!!enrolledMap[course.id]?.completed_at}
                          completedLessons={completedPerCourse[course.id] || 0}
                          totalLessons={lessonCountMap[course.id] || 0}
                          onImageUpdate={(url) => handleCourseImageUpdate(course.id, url)}
                          view="grid"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {levelCourses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          isEffectiveAdmin={isEffectiveAdmin}
                          isEnrolled={!!enrolledMap[course.id]}
                          isCompleted={!!enrolledMap[course.id]?.completed_at}
                          completedLessons={completedPerCourse[course.id] || 0}
                          totalLessons={lessonCountMap[course.id] || 0}
                          onImageUpdate={(url) => handleCourseImageUpdate(course.id, url)}
                          view="list"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredCourses.length === 0 && !isLoading && !isError && (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">No courses match your filters.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearchTerm("");
                  setSelectedLevel("all");
                  setCaseStudyOnly(false);
                  setPriceFilter("all");
                  setSortBy("default");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Courses;
