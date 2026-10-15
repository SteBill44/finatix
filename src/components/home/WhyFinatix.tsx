const POINTS = [
  { k: "Structure", title: "Mapped to the syllabus", text: "Every course follows the published CIMA syllabus areas for its paper, so you always know where a topic fits." },
  { k: "Feedback", title: "Explanations after practice", text: "Questions are marked the moment you submit, with the correct answer and the reasoning shown." },
  { k: "Progress", title: "Saved as you go", text: "Completed lessons and quiz results stay in your account, so you pick up exactly where you left off." },
  { k: "Continuity", title: "Every level, one account", text: "Move from Certificate to Strategic without switching providers. Courses and certificates of completion stay together." },
];

const WhyFinatix = () => (
  <section aria-labelledby="why-heading" className="border-t border-border bg-card py-24 lg:py-36">
    <div className="container mx-auto px-4">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.24em] text-primary">Why Finatix</p>
      <h2 id="why-heading" className="max-w-5xl text-4xl font-bold leading-[1.02] tracking-[-0.035em] text-foreground md:text-7xl">
        Structure, feedback and progress. <span className="text-muted-foreground">In one place, for every paper.</span>
      </h2>
      <dl className="mt-20 grid gap-x-12 gap-y-14 md:grid-cols-2 lg:ml-[33%] lg:mt-28">
        {POINTS.map((p) => (
          <div key={p.title} className="border-t border-border pt-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{p.k}</p>
            <dt className="mt-3 text-xl font-semibold text-foreground">{p.title}</dt>
            <dd className="mt-2 leading-relaxed text-muted-foreground">{p.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default WhyFinatix;
