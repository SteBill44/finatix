import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCourseContentStatus } from "@/hooks/useCourseContentStatus";
import { availabilityLabel, type AvailabilityTone } from "@/lib/courseAvailability";

const LEVELS = [
  { id: "certificate", name: "Certificate" },
  { id: "operational", name: "Operational" },
  { id: "management", name: "Management" },
  { id: "strategic", name: "Strategic" },
];

const TONE: Record<AvailabilityTone, string> = {
  live: "border-primary/50 bg-primary/10 text-foreground",
  partial: "border-border bg-secondary text-foreground",
  dev: "border-border bg-background text-muted-foreground",
  unknown: "border-border bg-background text-muted-foreground",
};

const CourseAvailability = () => {
  const { data: status } = useCourseContentStatus();
  const { data: courses } = useQuery({
    queryKey: ["home-course-list"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, slug, level").order("title");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section aria-labelledby="availability-heading" className="bg-card py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 id="availability-heading" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What's available today
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every CIMA paper, with an honest status. Courses in development show their outline and open once written and reviewed.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((lv) => (
            <div key={lv.id} className="rounded-2xl border border-border bg-background p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{lv.name}</h3>
              <ul className="space-y-2">
                {(courses ?? [])
                  .filter((c) => c.level === lv.id)
                  .map((c) => {
                    const a = availabilityLabel(status?.get(c.id));
                    return (
                      <li key={c.id}>
                        <Link
                          to={`/courses/${c.slug}`}
                          className="block rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="block truncate text-sm font-medium text-foreground">{c.title}</span>
                          <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] ${TONE[a.tone]}`}>
                            {a.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseAvailability;
