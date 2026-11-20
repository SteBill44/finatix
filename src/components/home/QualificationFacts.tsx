import { EXAM_GROUPS } from "@/lib/examPresentation";

/** Qualification facts, not learner metrics or claims of accreditation. */
export default function QualificationFacts() {
  const facts = [
    { value: EXAM_GROUPS.length, label: "Qualification levels" },
    { value: EXAM_GROUPS.flatMap((group) => group.exams).length, label: "Exams in one catalogue" },
    { value: EXAM_GROUPS[0].exams.length, label: "Free Certificate courses" },
    { value: 1, label: "Connected study account" },
  ];

  return (
    <section aria-label="Finatix at a glance" className="border-y border-border bg-card">
      <dl className="container grid grid-cols-2 gap-x-8 gap-y-8 px-5 py-10 md:grid-cols-4 md:px-8 md:py-12">
        {facts.map(({ value, label }) => (
          <div key={label} className="border-l border-border pl-5">
            <dd className="font-display text-4xl font-bold text-primary md:text-5xl">{value.toString().padStart(2, "0")}</dd>
            <dt className="mt-2 text-sm text-muted-foreground">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}