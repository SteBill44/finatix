import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import { useLearningContext } from "@/hooks/useLearningContext";
import { journeyAnalytics } from "@/lib/analytics";
import {
  CimaLevel,
  LEVEL_LABELS,
  LEVEL_ORDER,
  PAPERS,
  papersByLevel,
} from "@/lib/papers";

const StartPaper = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { setContext } = useLearningContext();

  const levelParam = params.get("level") as CimaLevel | null;
  const [level, setLevel] = useState<CimaLevel | null>(
    levelParam && LEVEL_ORDER.includes(levelParam) ? levelParam : null,
  );

  useEffect(() => {
    journeyAnalytics.selected({ journey: "paper" });
  }, []);

  // Only offer papers that actually exist as published courses.
  const { data: available } = useQuery({
    queryKey: ["available-course-slugs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("slug");
      if (error) throw error;
      return new Set((data ?? []).map((c) => c.slug));
    },
  });

  const isAvailable = (courseSlug: string) => !available || available.has(courseSlug);

  const choose = (slugCode: string) => {
    const paper = PAPERS.find((p) => p.slugCode === slugCode);
    if (!paper) return;
    setContext({
      journey: "paper",
      paperSlug: paper.courseSlug,
      level: paper.level,
    });
    journeyAnalytics.contextSet({
      journey: "paper",
      level: paper.level,
      paper_code: paper.code,
    });
    navigate(`/papers/${paper.slugCode}`);
  };

  return (
    <Layout>
      <SEOHead
        title="Choose your CIMA paper"
        description="Pick the CIMA paper you're studying and go straight to its outcomes, sample content and access terms."
      />
      <section className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Studying for a paper
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Which paper are you sitting?
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pick a level, then a paper. You can change this at any time.
        </p>

        <fieldset className="mt-8">
          <legend className="mb-3 text-sm font-semibold text-foreground">Level</legend>
          <div className="flex flex-wrap gap-2">
            {LEVEL_ORDER.map((l) => (
              <Button
                key={l}
                type="button"
                variant={level === l ? "default" : "outline"}
                onClick={() => {
                  setLevel(l);
                  setParams({ level: l }, { replace: true });
                }}
                aria-pressed={level === l}
              >
                {LEVEL_LABELS[l]}
              </Button>
            ))}
          </div>
        </fieldset>

        {level && (
          <fieldset className="mt-8">
            <legend className="mb-3 text-sm font-semibold text-foreground">Paper</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {papersByLevel(level).map((paper) => {
                const enabled = isAvailable(paper.courseSlug);
                return (
                  <button
                    key={paper.code}
                    type="button"
                    disabled={!enabled}
                    onClick={() => choose(paper.slugCode)}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                      {paper.code}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm text-muted-foreground">{paper.focus}</span>
                      {!enabled && (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          Not available yet
                        </span>
                      )}
                    </span>
                    {enabled && (
                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
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

export default StartPaper;
