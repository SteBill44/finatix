const POINTS = [
  { title: "Mapped to the syllabus", text: "Every course follows the published CIMA syllabus areas for its paper, so you always know where a topic fits." },
  { title: "Explanations, not just answers", text: "Practice questions are marked the moment you submit, with the correct answer and the reasoning shown." },
  { title: "Progress kept in one place", text: "Your account remembers the lessons and quizzes you've completed, so you can pick up where you left off." },
  { title: "Every level, one account", text: "Move from Certificate to Strategic without switching providers. Your courses, progress and certificates of completion stay together." },
];

const WhyFinatix = () => (
  <section aria-labelledby="why-heading" className="bg-background py-20 lg:py-28">
    <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why Finatix</p>
        <h2 id="why-heading" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Study that respects your time
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          CIMA is demanding. Finatix keeps the structure clear and the feedback useful, so your hours go into the topics that matter.
        </p>
      </div>
      <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {POINTS.map((p) => (
          <div key={p.title} className="border-l-2 border-primary/60 pl-5">
            <dt className="font-semibold text-foreground">{p.title}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default WhyFinatix;
