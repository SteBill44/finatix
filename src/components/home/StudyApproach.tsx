const STEPS = [
  { n: "Learn", text: "Work through lessons in syllabus order, one topic at a time." },
  { n: "Practise", text: "Test each topic with short quizzes marked instantly, with the reasoning explained." },
  { n: "Prepare", text: "Revisit weaker topics before the exam. Mock exams are being built and will be labelled when ready." },
];

const StudyApproach = () => (
  <section aria-labelledby="approach-heading" className="border-y border-border bg-card py-20 lg:py-28">
    <div className="container mx-auto px-4">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">The approach</p>
        <h2 id="approach-heading" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Learn it, practise it, be ready for it
        </h2>
      </div>
      <ol className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3 md:gap-0">
        {STEPS.map((s, i) => (
          <li key={s.n} className="relative md:px-8 md:first:pl-0 md:last:pr-0 md:[&:not(:first-child)]:border-l md:border-border">
            <span className="text-6xl font-bold leading-none text-primary/20">{i + 1}</span>
            <h3 className="mt-4 text-xl font-semibold text-foreground">{s.n}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default StudyApproach;
