import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BA1_SLUG = "ba1-business-economics";

/** Real BA1 lesson outline (public curriculum metadata only). */
export function useBa1Outline() {
  return useQuery({
    queryKey: ["home-ba1-outline"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("slug", BA1_SLUG)
        .maybeSingle();
      if (error || !course) throw error ?? new Error("not found");
      const { data: lessons, error: e2 } = await supabase.rpc("get_course_curriculum", { p_course_id: course.id });
      if (e2) throw e2;
      return {
        title: course.title as string,
        lessons: ((lessons ?? []) as { id: string; title: string; order_index: number }[]).sort(
          (a, b) => a.order_index - b.order_index,
        ),
      };
    },
  });
}

/**
 * A static, styled picture of the real study workspace: the BA1 outline with
 * its lesson quizzes. No personal stats, no scores, no calculations.
 */
const HeroPreview = () => {
  const { data } = useBa1Outline();
  const lessons = data?.lessons.slice(0, 6) ?? [];

  return (
    <figure
      aria-label="Preview of the BA1 course workspace"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5"
    >
      <div className="flex items-center gap-1.5 border-b border-border bg-secondary/40 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="ml-3 truncate text-xs text-muted-foreground">finatix.io/courses/{BA1_SLUG}</span>
      </div>
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Certificate · Free</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{data?.title ?? "BA1 – Fundamentals of Business Economics"}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {data ? `${data.lessons.length} lessons` : "Lessons"} · each with a short marked quiz
        </p>
        <ol className="mt-4 space-y-1.5">
          {(lessons.length ? lessons : Array.from({ length: 6 }, (_, i) => ({ id: String(i), title: "", order_index: i }))).map(
            (l, i) => (
              <li
                key={l.id}
                className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-secondary text-[11px] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {l.title || <span className="inline-block h-3 w-40 rounded bg-muted" />}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  <ClipboardList className="h-3 w-3" aria-hidden="true" />
                  Quiz
                </span>
              </li>
            ),
          )}
        </ol>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Marked instantly, every answer explained
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Free account
          </span>
        </div>
      </div>
      <figcaption className="sr-only">
        The BA1 course page lists every lesson with its quiz. Lesson notes are outlines for now.
      </figcaption>
    </figure>
  );
};

export default HeroPreview;
