import {
  BarChart2,
  FileQuestion,
  Layers,
  MessageSquareText,
  Smartphone,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Practice that follows your weak spots",
    description:
      "Practice sessions pull more questions from the syllabus areas you've been getting wrong, rather than serving the same set to everyone.",
  },
  {
    icon: MessageSquareText,
    title: "An explanation with every answer",
    description:
      "Each question comes with the reasoning behind the correct answer, so a wrong answer teaches you something.",
  },
  {
    icon: FileQuestion,
    title: "Exam-style mock papers",
    description:
      "Timed mocks marked by the same grading used throughout the course, with a breakdown of where you lost marks.",
  },
  {
    icon: BarChart2,
    title: "Progress and readiness tracking",
    description:
      "See your competency across each syllabus area and a readiness score built from your own attempts.",
  },
  {
    icon: Layers,
    title: "Flashcards for retention",
    description:
      "Spaced-repetition decks to keep earlier topics fresh while you work through later ones.",
  },
  {
    icon: Smartphone,
    title: "Study on any device",
    description:
      "Lessons, practice and mocks all work on a phone, tablet or laptop, so you can study in short sessions.",
  },
];

const Features = () => {
  return (
    <section className="bg-background py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            What's inside
          </p>
          <h2 className="mb-3 text-2xl font-bold text-charcoal md:text-3xl lg:text-4xl">
            Lessons, practice and feedback in one loop
          </h2>
          <p className="text-muted-foreground">
            Everything below is on the platform today. Nothing is coming soon.
          </p>
        </div>

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Features;
