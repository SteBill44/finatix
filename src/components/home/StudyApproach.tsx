const STEPS = [
  { n: "Learn", text: "Work through lessons in CIMA syllabus order, with the whole paper mapped out before you begin." },
  { n: "Practise", text: "Test each topic with short lesson quizzes, marked instantly with the reasoning explained." },
  { n: "Prepare", text: "Track the lessons and quizzes you've completed, revisit weaker topics and go into the exam with a plan." },
];

const StudyApproach = () => (
  <section id="approach" aria-labelledby="approach-heading" className="relative scroll-mt-16 overflow-hidden bg-foreground py-24 text-background lg:py-32">
    <div aria-hidden="true" className="hero-atmosphere pointer-events-none absolute inset-0 opacity-80" />
    <div className="container relative mx-auto px-4">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">How it works</p>
        <h2 id="approach-heading" className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-5xl">
          Learn it. Practise it. Be ready for it.
        </h2>
        <p className="mt-4 text-lg opacity-70">One rhythm for every paper, from BA1 to the Strategic case study.</p>
      </div>
      <ol className="mt-16 grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.n} className="rounded-xl border border-background/15 bg-background/5 p-8 backdrop-blur transition-colors hover:border-primary/60">
            <span className="font-mono text-5xl font-light text-sheen">0{i + 1}</span>
            <h3 className="mt-6 text-2xl font-bold tracking-tight">{s.n}</h3>
            <p className="mt-3 leading-relaxed opacity-70">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default StudyApproach;
