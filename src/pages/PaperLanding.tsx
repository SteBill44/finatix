import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, BookOpen, Clock, FileText, Lock } from "lucide-react";
import { useLearningContext } from "@/hooks/useLearningContext";
import { journeyAnalytics } from "@/lib/analytics";
import { LEVEL_LABELS, paperBySlugCode, papersByLevel } from "@/lib/papers";
import TryQuestion from "@/components/home/TryQuestion";

interface CurriculumRow {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  duration_minutes: number | null;
  has_video: boolean;
}

const PaperLanding = () => {
  const { paperCode } = useParams<{ paperCode: string }>();
  const paper = paperBySlugCode(paperCode);
  const { setContext } = useLearningContext();

  const { data: course, isLoading } = useQuery({
    queryKey: ["paper-course", paper?.courseSlug],
    enabled: !!paper,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, description, price, duration_hours, level")
        .eq("slug", paper!.courseSlug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: curriculum } = useQuery({
    queryKey: ["paper-curriculum", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as never as {
        rpc: (n: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
      }).rpc("get_course_curriculum", { p_course_id: course!.id });
      if (error) throw error;
      return (data ?? []) as CurriculumRow[];
    },
  });

  useEffect(() => {
    if (!paper) return;
    setContext({
      journey: paper.kind === "case-study" ? "case-study" : "paper",
      paperSlug: paper.courseSlug,
      level: paper.level,
    });
  }, [paper, setContext]);

  if (!paperCode) return <Navigate to="/start/paper" replace />;
  if (!paper) {
    return (
      <Layout>
        <SEOHead title="Paper not found" noIndex />
        <section className="container mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">We don't publish that paper</h1>
          <p className="mt-3 text-muted-foreground">
            Pick from the papers we do cover.
          </p>
          <Button asChild className="mt-6">
            <Link to="/start/paper">Choose a paper</Link>
          </Button>
        </section>
      </Layout>
    );
  }

  const isFree = course ? Number(course.price) === 0 : false;
  const lessons = (curriculum ?? []).slice().sort((a, b) => a.order_index - b.order_index);
  const siblings = papersByLevel(paper.level).filter((p) => p.code !== paper.code);

  return (
    <Layout>
      <SEOHead
        title={course?.title ?? ` – CIMA paper`}
        description={`${paper.code}: ${paper.focus} Learning outcomes, sample content and access terms from Finatix.`}
      />
      <section className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link to="/start/paper" className="hover:text-foreground">Choose a paper</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{paper.code}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {LEVEL_LABELS[paper.level]} ·{" "}
              {paper.kind === "case-study" ? "Case study" : "Objective test"}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {course?.title ?? paper.code}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              {course?.description ?? paper.focus}
            </p>

            {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}

            {!isLoading && !course && (
              <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-5">
                <p className="text-sm text-muted-foreground">
                  This paper isn't published on Finatix yet, so there's nothing
                  to buy or start here.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/courses">See what is available</Link>
                </Button>
              </div>
            )}

            {course && (
              <>
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    {lessons.length} lessons
                  </span>
                  {!!course.duration_hours && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      about {course.duration_hours} hours
                    </span>
                  )}
                </div>

                <h2 className="mt-10 text-xl font-semibold text-foreground">
                  What you'll be able to do
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Taken from the course itself - these are the actual lessons.
                </p>
                <ol className="mt-4 space-y-2">
                  {lessons.map((l, i) => (
                    <li
                      key={l.id}
                      className="flex gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm"
                    >
                      <span className="w-6 flex-shrink-0 font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block font-medium text-foreground">{l.title}</span>
                        {l.description && (
                          <span className="mt-0.5 block text-muted-foreground line-clamp-2">
                            {l.description}
                          </span>
                        )}
                      </span>
                      {!isFree && (
                        <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                      )}
                    </li>
                  ))}
                  {lessons.length === 0 && (
                    <li className="text-sm text-muted-foreground">
                      Lesson list is being prepared for this paper.
                    </li>
                  )}
                </ol>

                <h2 className="mt-10 text-xl font-semibold text-foreground">Access terms</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>
                    {isFree
                      ? "Free. You need a Finatix account to open the lessons."
                      : `£${Number(course.price).toFixed(0)} one-off payment, VAT included. Lifetime access to this course.`}
                  </li>
                  <li>Lessons, practice questions and explanations are included.</li>
                  <li>
                    CIMA exam entry and exam fees are paid to CIMA separately - they are not
                    part of this price.
                  </li>
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link
                      to={`/courses/${course.slug}`}
                      onClick={() =>
                        journeyAnalytics.firstLearningActivity({
                          course_slug: course.slug,
                          paper_code: paper.code,
                          activity: isFree ? "open_free_course" : "open_paid_course",
                        })
                      }
                    >
                      {isFree ? `Start ${paper.code} free` : `Get ${paper.code}`}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/pricing">See bundle pricing</Link>
                  </Button>
                </div>
              </>
            )}

            {siblings.length > 0 && (
              <>
                <h2 className="mt-12 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Other papers at this level
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {siblings.map((s) => (
                    <Link
                      key={s.code}
                      to={`/papers/${s.slugCode}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/60"
                    >
                      {s.code}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside>
            <div className="lg:sticky lg:top-24">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                Sample content
              </h2>
              <p className="mb-3 text-sm text-muted-foreground">
                {isFree
                  ? "A real question from this level's free course."
                  : `We don't yet publish a free sample specific to ${paper.code}. This is a real question from our free BA1 course, so you can see the format and the explanations.`}
              </p>
              <TryQuestion
                onStart={() =>
                  journeyAnalytics.sampleStart({
                    paper_code: paper.code,
                    course_slug: course?.slug,
                    kind: "question",
                  })
                }
                onComplete={() =>
                  journeyAnalytics.sampleComplete({
                    paper_code: paper.code,
                    course_slug: course?.slug,
                    kind: "question",
                  })
                }
              />
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
};

export default PaperLanding;
