import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useLearningContext } from "@/hooks/useLearningContext";
import { journeyAnalytics } from "@/lib/analytics";
import { CimaLevel, LEVEL_LABELS, caseStudyPapers, papersByLevel } from "@/lib/papers";
import { VERIFIED_SITTINGS, hasVerifiedSittings, sittingsForLevel } from "@/data/sittings";

const CASE_LEVELS: CimaLevel[] = ["operational", "management", "strategic"];

const StartCaseStudy = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { setContext } = useLearningContext();

  const levelParam = params.get("level") as CimaLevel | null;
  const [level, setLevel] = useState<CimaLevel | null>(
    levelParam && CASE_LEVELS.includes(levelParam) ? levelParam : null,
  );
  const [sitting, setSitting] = useState<string | null>(params.get("sitting"));

  useEffect(() => {
    journeyAnalytics.selected({ journey: "case-study" });
  }, []);

  const paper = useMemo(
    () => caseStudyPapers().find((p) => p.level === level) ?? null,
    [level],
  );

  const { data: course, isLoading } = useQuery({
    queryKey: ["case-study-course", paper?.courseSlug],
    enabled: !!paper,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, description, price, duration_hours")
        .eq("slug", paper!.courseSlug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: curriculum } = useQuery({
    queryKey: ["case-study-curriculum", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as never as {
        rpc: (n: string, a: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
      }).rpc("get_course_curriculum", { p_course_id: course!.id });
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; title: string; order_index: number }>;
    },
  });

  const commit = (nextLevel: CimaLevel, nextSitting: string | null) => {
    const p = caseStudyPapers().find((x) => x.level === nextLevel);
    setContext({
      journey: "case-study",
      level: nextLevel,
      paperSlug: p?.courseSlug,
      sitting: nextSitting ?? undefined,
    });
    journeyAnalytics.contextSet({
      journey: "case-study",
      level: nextLevel,
      paper_code: p?.code,
      sitting: nextSitting ?? undefined,
    });
  };

  return (
    <Layout>
      <SEOHead
        title="CIMA case study preparation"
        description="Choose your CIMA case study level and see the preparation material Finatix publishes for it."
      />
      <section className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Case study preparation
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Which case study are you preparing for?
        </h1>

        <fieldset className="mt-8">
          <legend className="mb-3 text-sm font-semibold text-foreground">Level</legend>
          <div className="flex flex-wrap gap-2">
            {CASE_LEVELS.map((l) => (
              <Button
                key={l}
                type="button"
                variant={level === l ? "default" : "outline"}
                aria-pressed={level === l}
                onClick={() => {
                  setLevel(l);
                  setSitting(null);
                  setParams({ level: l }, { replace: true });
                  commit(l, null);
                }}
              >
                {LEVEL_LABELS[l]}
              </Button>
            ))}
          </div>
        </fieldset>

        {level && (
          <fieldset className="mt-8">
            <legend className="mb-3 text-sm font-semibold text-foreground">Sitting</legend>
            {hasVerifiedSittings() ? (
              <div className="flex flex-wrap gap-2">
                {sittingsForLevel(level).map((s) => (
                  <Button
                    key={s.id}
                    type="button"
                    variant={sitting === s.id ? "default" : "outline"}
                    aria-pressed={sitting === s.id}
                    onClick={() => {
                      setSitting(s.id);
                      setParams({ level, sitting: s.id }, { replace: true });
                      commit(level, s.id);
                    }}
                  >
                    {s.label}
                  </Button>
                ))}
                {sittingsForLevel(level).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No sittings are currently listed as supported for this level.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  We don't list supported sitting windows yet, so we won't guess
                  them here. Check your exam date with CIMA. The preparation
                  material below isn't tied to a particular sitting.
                </p>
              </div>
            )}
          </fieldset>
        )}

        {level && paper && (
          <div className="mt-10 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">
              {course?.title ?? `${paper.code} case study`}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{paper.focus}</p>

            {isLoading && (
              <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
            )}

            {!isLoading && !course && (
              <p className="mt-4 text-sm text-muted-foreground">
                This case study course isn't published yet. Try another level or
                browse the papers that feed into it.
              </p>
            )}

            {course && (
              <>
                {!!curriculum?.length && (
                  <>
                    <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      What the course covers
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {curriculum
                        .slice()
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((l) => (
                          <li key={l.id}>• {l.title}</li>
                        ))}
                    </ul>
                  </>
                )}

                <p className="mt-6 text-sm text-muted-foreground">
                  Feeder papers for this case study:{" "}
                  {papersByLevel(level)
                    .filter((p) => p.kind === "objective-test")
                    .map((p) => p.code)
                    .join(", ")}
                  .
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link to={`/papers/${paper.slugCode}`}>
                      Open {paper.code} preparation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/courses/ba1-business-economics">
                      Try a free sample lesson
                    </Link>
                  </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  We don't publish a marked example of examiner-style feedback
                  for this case study yet, so none is shown. When one is
                  available it will appear here.
                </p>
              </>
            )}
          </div>
        )}

        <div className="mt-10">
          <Button variant="ghost" onClick={() => navigate("/courses")}>
            Skip - browse all courses instead
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default StartCaseStudy;
