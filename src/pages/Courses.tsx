import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
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
} from "lucide-react";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useAdminView } from "@/contexts/AdminViewContext";
import { useQueryClient } from "@tanstack/react-query";
import AdminImageDropZone from "@/components/admin/AdminImageDropZone";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useEnrollments, useLessonProgress } from "@/hooks/useStudentProgress";
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
  certificate: {
    label: "Certificate (CBA)",
    icon: Award,
    gradient: "from-teal-600 to-teal-800",
    lightGradient: "from-teal-400/80 to-teal-600/80",
    badge: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
    border: "border-l-teal-500",
    ring: "ring-teal-500/20",
    sub: "BA1 · BA2 · BA3 · BA4",
  },
  operational: {
    label: "Operational Level",
    icon: BookOpen,
    gradient: "from-primary to-orange-700",
    lightGradient: "from-primary/80 to-orange-600/80",
    badge: "bg-primary/15 text-primary",
    border: "border-l-primary",
    ring: "ring-primary/20",
    sub: "E1 · P1 · F1 + Case Study",
  },
  management: {
    label: "Management Level",
    icon: BarChart3,
    gradient: "from-purple-600 to-purple-900",
    lightGradient: "from-purple-500/80 to-purple-700/80",
    badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    border: "border-l-purple-500",
    ring: "ring-purple-500/20",
    sub: "E2 · P2 · F2 + Case Study",
  },
  strategic: {
    label: "Strategic Level",
    icon: Target,
    gradient: "from-rose-600 to-rose-900",
    lightGradient: "from-rose-500/80 to-rose-700/80",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    border: "border-l-rose-500",
    ring: "ring-rose-500/20",
    sub: "E3 · P3 · F3 + Case Study",
  },
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
  const cfg = levelConfig[course.level as Level] || levelConfig.operational;
  const code = getCourseCode(course.slug);
  const caseStudy = isCaseStudy(course.slug);
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (view === "list") {
    return (
      <AdminImageDropZone onImageUpdated={onImageUpdate}>
        <Link
          to={`/courses/${course.slug}`}
          className="group flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all"
        >
          {/* Color swatch */}
          <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-base">{code}</span>
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{code}</span>
              {caseStudy && <Badge variant="secondary" className="text-xs">Case Study</Badge>}
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              )}
              {isEnrolled && !isCompleted && (
                <Badge variant="outline" className="text-xs text-primary border-primary/40">Enrolled</Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm text-foreground truncate">{course.title}</h3>
            {course.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{course.description}</p>
            )}
            {isEnrolled && totalLessons > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <Progress value={progressPct} className="h-1 flex-1 max-w-32" />
                <span className="text-[10px] text-muted-foreground">{progressPct}%</span>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex-shrink-0 text-right hidden sm:block">
            {totalLessons > 0 && (
              <p className="text-xs text-muted-foreground mb-0.5">{totalLessons} lessons</p>
            )}
            <p className="text-xs text-muted-foreground">{course.duration_hours || 30}h</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {course.price === 0 ? <span className="text-green-600 dark:text-green-400">Free</span> : `£${course.price}`}
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </Link>
      </AdminImageDropZone>
    );
  }

  // Grid card
  return (
    <AdminImageDropZone onImageUpdated={onImageUpdate}>
      <Link
        to={`/courses/${course.slug}`}
        className={`group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all flex flex-col ring-0 hover:ring-2 ${cfg.ring}`}
      >
        {/* Header — image or gradient */}
        <div className="relative h-36 overflow-hidden flex-shrink-0">
          {course.image_url ? (
            <OptimizedImage
              src={course.image_url}
              alt={course.title}
              aspectRatio="video"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
              <span className="text-white font-black text-5xl opacity-80 tracking-tight">{code}</span>
            </div>
          )}
          {/* Overlay badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
            {caseStudy && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 text-white backdrop-blur-sm">
                Case Study
              </span>
            )}
          </div>
          {/* Enrollment badge top-right */}
          {isCompleted && (
            <div className="absolute top-2.5 right-2.5">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500 text-white">
                <CheckCircle2 className="w-3 h-3" /> Done
              </span>
            </div>
          )}
          {isEnrolled && !isCompleted && (
            <div className="absolute top-2.5 right-2.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
                Enrolled
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{code}</span>
          </div>

          <h3 className="text-sm font-semibold text-foreground leading-snug mb-1.5 line-clamp-2 min-h-[2.5rem]">
            {course.title}
          </h3>

          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
              {course.description}
            </p>
          )}

          {/* Progress bar for enrolled */}
          {isEnrolled && totalLessons > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{completedLessons}/{totalLessons} lessons</span>
                <span>{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration_hours || 30}h
              </span>
              {totalLessons > 0 && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {totalLessons} lessons
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {course.price === 0
                  ? <span className="text-green-600 dark:text-green-400">Free</span>
                  : `£${course.price}`}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </AdminImageDropZone>
  );
}

// ── Page ──────────────────────────────────────────────────────────
const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { isStudentView } = useAdminView();
  const queryClient = useQueryClient();
  const isEffectiveAdmin = isAdmin && !isStudentView;

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("level", { ascending: true })
        .order("title", { ascending: true });
      if (error) throw error;
      return data as Course[];
    },
  });

  // Lesson counts per course (total)
  const { data: lessonCountMap = {} } = useQuery({
    queryKey: ["lesson_counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("course_id");
      if (error) return {} as Record<string, number>;
      return (data || []).reduce((acc, l) => {
        acc[l.course_id] = (acc[l.course_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    },
  });

  // Enrollment data
  const { data: enrollments = [] } = useEnrollments();
  const enrolledMap = Object.fromEntries(enrollments.map((e) => [e.course_id, e]));

  // Completed lessons per course
  const { data: allProgress = [] } = useLessonProgress();
  const completedPerCourse: Record<string, number> = {};
  (allProgress as Array<{ completed: boolean; lessons: { course_id: string } | null }>).forEach((p) => {
    if (p.completed && p.lessons?.course_id) {
      const cid = p.lessons.course_id;
      completedPerCourse[cid] = (completedPerCourse[cid] || 0) + 1;
    }
  });

  const handleCourseImageUpdate = async (courseId: string, newUrl: string) => {
    await supabase.from("courses").update({ image_url: newUrl }).eq("id", courseId);
    queryClient.invalidateQueries({ queryKey: ["courses"] });
  };

  const filteredCourses = courses
    .sort((a, b) => getCourseOrder(a.slug) - getCourseOrder(b.slug))
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });

  const groupedCourses = Object.fromEntries(
    levelOrder.map((level) => [level, filteredCourses.filter((c) => c.level === level)])
  );

  return (
    <Layout>
      <SEOHead
        title="CIMA Courses"
        description="Explore our comprehensive CIMA courses from Certificate level to Strategic Professional."
        keywords="CIMA courses, BA1, BA2, BA3, BA4, E1, P1, F1, E2, P2, F2, E3, P3, F3, case study"
      />

      {/* ── Hero ── */}
      <section className="relative pt-32 lg:pt-36 pb-16 lg:pb-20 hex-pattern hero-gradient-light overflow-hidden">
        <div className="gradient-orb gradient-orb-primary w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] -top-20 -left-20 pointer-events-none" />
        <div className="gradient-orb gradient-orb-accent w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] top-1/4 -right-20 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="animate-fade-up text-4xl md:text-5xl font-bold text-foreground mb-4">
              EXPLORE <span className="text-primary">CIMA COURSES</span>
            </h1>
            <p className="animate-fade-up-delay-1 text-lg text-muted-foreground">
              From Certificate in Business Accounting to Strategic Case Study — comprehensive prep for every CIMA exam.
            </p>
          </div>
        </div>
      </section>

      {/* ── Level overview strip ── */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {levelOrder.map((level) => {
              const cfg = levelConfig[level];
              const Icon = cfg.icon;
              const count = courses.filter((c) => c.level === level).length;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(selectedLevel === level ? "all" : level)}
                  className={`text-center p-4 rounded-xl border transition-all ${
                    selectedLevel === level
                      ? `border-transparent bg-gradient-to-br ${cfg.gradient} text-white shadow-md`
                      : "border-border hover:border-primary/30 hover:bg-secondary/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    selectedLevel === level ? "bg-white/20" : `bg-gradient-to-br ${cfg.gradient}/10`
                  }`}>
                    <Icon className={`w-5 h-5 ${selectedLevel === level ? "text-white" : ""}`} />
                  </div>
                  <h3 className={`font-semibold text-sm mb-0.5 ${selectedLevel === level ? "text-white" : "text-foreground"}`}>
                    {cfg.label}
                  </h3>
                  <p className={`text-xs ${selectedLevel === level ? "text-white/70" : "text-muted-foreground"}`}>
                    {cfg.sub}
                  </p>
                  {count > 0 && (
                    <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      selectedLevel === level ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                    }`}>
                      {count} courses
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Filters + Courses ── */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses (BA1, E2, Case Study…)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-full"
              />
            </div>
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
            {/* Enrolled info chip */}
            {user && enrollments.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full flex-shrink-0">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                {enrollments.length} enrolled
              </span>
            )}
          </div>

          {isLoading && <CourseGridSkeleton count={8} />}

          {!isLoading && levelOrder.map((level) => {
            const levelCourses = groupedCourses[level] || [];
            if (levelCourses.length === 0) return null;
            const cfg = levelConfig[level];
            const Icon = cfg.icon;

            return (
              <div key={level} className="mb-14 last:mb-0">
                {/* Level header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{cfg.label}</h2>
                    <p className="text-xs text-muted-foreground">{cfg.sub}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                    {levelCourses.length} courses
                  </span>
                </div>

                {view === "grid" ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            );
          })}

          {filteredCourses.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">No courses match your search.</p>
              <Button
                variant="outline"
                onClick={() => { setSearchTerm(""); setSelectedLevel("all"); }}
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
