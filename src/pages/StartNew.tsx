import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLearningContext } from "@/hooks/useLearningContext";
import { journeyAnalytics } from "@/lib/analytics";
import { LEVEL_ORDER, LEVEL_LABELS, papersByLevel } from "@/lib/papers";
import TryQuestion from "@/components/home/TryQuestion";

const StartNew = () => {
  const { setContext } = useLearningContext();

  useEffect(() => {
    setContext({ journey: "new" });
    journeyAnalytics.contextSet({ journey: "new" });
  }, [setContext]);

  const { data: freeCourses } = useQuery({
    queryKey: ["free-certificate-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, description, duration_hours, price")
        .eq("level", "certificate")
        .order("title");
      if (error) throw error;
      return data ?? [];
    },
  });

  const free = (freeCourses ?? []).filter((c) => Number(c.price) === 0);

  return (
    <Layout>
      <SEOHead
        title="New to CIMA? Start here"
        description="How the CIMA qualification is structured, and how to begin with Finatix's free Certificate-level courses."
      />
      <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          New to CIMA
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Start at the beginning, for free
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          CIMA is studied in stages. Most people with no accounting background
          start at Certificate level, then work through Operational, Management
          and Strategic. Each of those three levels has three papers plus a case
          study.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Exemptions from Certificate level depend on your prior qualifications
          and are decided by CIMA, not by us. Check your own position with CIMA
          before skipping a level - we can't confirm exemptions for you.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              The four free Certificate courses
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {free.length} of our Certificate courses cost nothing. Create a
              free account to open the lessons.
            </p>
            <ul className="mt-5 space-y-3">
              {free.map((course) => (
                <li key={course.id}>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      <span className="block font-medium text-foreground">{course.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/courses/ba1-business-economics">
                  Start with BA1
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/why-cima">What is CIMA?</Link>
              </Button>
            </div>

            <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              What comes after Certificate
            </h3>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              {LEVEL_ORDER.filter((l) => l !== "certificate").map((level) => (
                <p key={level}>
                  <span className="font-medium text-foreground">{LEVEL_LABELS[level]}:</span>{" "}
                  {papersByLevel(level).map((p) => p.code).join(", ")}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-foreground">
              Try a question from BA1
            </h2>
            <TryQuestion />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StartNew;
