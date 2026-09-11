import {
  BarChart2,
  FileQuestion,
  Layers,
  MessageSquareText,
  Smartphone,
  Target,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

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
    <section className="bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="What's inside"
          title="Lessons, practice and feedback in one loop"
          description="Everything below is on the platform today. Nothing is coming soon."
        />

        <ul className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 motion-reduce:hover:translate-y-0"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-inset ring-primary/15 transition-colors group-hover:bg-primary/15">
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
