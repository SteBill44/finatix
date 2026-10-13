const STEPS = [
  { n: "Learn", text: "Work through lessons in CIMA syllabus order, with the whole paper mapped out before you begin." },
  { n: "Practise", text: "Test each topic with short lesson quizzes, marked instantly with the reasoning explained." },
  { n: "Prepare", text: "Track the lessons and quizzes you've completed, revisit weaker topics and go into the exam with a plan." },
];

const StudyApproach = () => (
  <section id="approach" aria-labelledby="approach-heading" className="scroll-mt-20 border-y border-border bg-card py-20 lg:py-28">
    <div className="container mx-auto grid gap-14 px-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">The approach</p>
        <h2 id="approach-heading" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Learn it, practise it, be ready for it
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          One simple rhythm for every paper, from BA1 to the Strategic case study.
        </p>
      </div>
      <ol className="divide-y divide-border border-y border-border">
        {STEPS.map((s, i) => (
          <li key={s.n} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[4rem_10rem_minmax(0,1fr)] sm:items-baseline">
            <span className="font-mono text-sm text-primary">0{i + 1}</span>
            <h3 className="text-xl font-semibold text-foreground">{s.n}</h3>
            <p className="col-span-2 leading-relaxed text-muted-foreground sm:col-span-1">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default StudyApproach;
