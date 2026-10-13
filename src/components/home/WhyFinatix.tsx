import { ListTree, CheckCircle2, BarChart3, Layers } from "lucide-react";

const POINTS = [
  { icon: ListTree, title: "Mapped to the syllabus", text: "Every course follows the published CIMA syllabus areas for its paper, so you always know where a topic fits." },
  { icon: CheckCircle2, title: "Explanations after practice", text: "Questions are marked the moment you submit, with the correct answer and the reasoning shown." },
  { icon: BarChart3, title: "Saved as you go", text: "Completed lessons and quiz results stay in your account, so you pick up exactly where you left off." },
  { icon: Layers, title: "Every level, one account", text: "Move from Certificate to Strategic without switching providers. Courses and certificates of completion stay together." },
];

const WhyFinatix = () => (
  <section aria-labelledby="why-heading" className="border-y border-border bg-card py-24 lg:py-32">
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why choose Finatix</p>
        <h2 id="why-heading" className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground md:text-5xl">
          Study that stays structured
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">Structure, feedback and progress in one place, for every paper.</p>
      </div>
      <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="card-spark rounded-xl p-7">
            <span className="flex h-11 w-11 items-center justify-center icon-chip rounded-lg">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default WhyFinatix;
