const STEPS = [
  { n: "Learn", text: "Work through lessons in CIMA syllabus order, with the whole paper mapped out before you begin." },
  { n: "Practise", text: "Test each topic with short lesson quizzes, marked instantly with the reasoning explained." },
  { n: "Prepare", text: "Track the lessons and quizzes you've completed, revisit weaker topics and go into the exam with a plan." },
];

/** Simple progression graphic: three nodes on one rule, filled in sequence. Static, decorative. */
const Progression = () => (
  <svg viewBox="0 0 40 400" aria-hidden="true" className="h-full max-h-[420px] w-10 text-foreground">
    <line x1="20" y1="10" x2="20" y2="390" stroke="currentColor" strokeOpacity="0.15" />
    <line x1="20" y1="10" x2="20" y2="260" stroke="hsl(var(--primary))" strokeWidth="2" />
    {[20, 200, 380].map((y, i) => (
      <circle key={y} cx="20" cy={y} r="7" fill={i < 2 ? "hsl(var(--primary))" : "hsl(var(--background))"} stroke="hsl(var(--primary))" strokeWidth="2" />
    ))}
  </svg>
);

const StudyApproach = () => (
  <section id="approach" aria-labelledby="approach-heading" className="scroll-mt-16 border-t border-border bg-background py-24 lg:py-36">
    <div className="container mx-auto px-4">
      <div className="mb-16 flex flex-col justify-between gap-6 lg:mb-24 lg:flex-row lg:items-end">
        <div>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.24em] text-primary">The approach</p>
          <h2 id="approach-heading" className="text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-foreground md:text-6xl">
            Learn it. Practise it.
            <br />
            Be ready for it.
          </h2>
        </div>
        <p className="max-w-sm text-lg text-muted-foreground">One rhythm for every paper, from BA1 to the Strategic case study.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[3rem_minmax(0,1fr)] lg:gap-16">
        <div className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <Progression />
        </div>
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.n} className="grid gap-4 border-t border-border py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:py-14">
              <div className="flex items-baseline gap-5">
                <span className="font-mono text-sm text-primary">0{i + 1}</span>
                <h3 className="mb-0 text-4xl font-bold tracking-[-0.03em] text-foreground md:text-5xl">{s.n}</h3>
              </div>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground md:pt-3">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
);

export default StudyApproach;
