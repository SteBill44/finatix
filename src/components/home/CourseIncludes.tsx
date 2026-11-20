import { BookOpen, ListChecks, Layers, ChartNoAxesCombined } from "lucide-react";

const ITEMS = [
  { icon: BookOpen, name: "Syllabus-mapped lessons", text: "Topics in CIMA syllabus order, so you always know what comes next." },
  { icon: ListChecks, name: "Marked practice questions", text: "Quizzes marked instantly, with the reasoning explained." },
  { icon: Layers, name: "Flashcards", text: "Spaced repetition to keep key terms and formulas fresh." },
  { icon: ChartNoAxesCombined, name: "Saved progress", text: "Lessons and quiz results stay in your account across devices." },
];

export default function CourseIncludes() {
  return (
    <section aria-labelledby="includes-title" className="section-space border-t border-border bg-background">
      <div className="container px-5 md:px-8">
        <p className="eyebrow">In every course</p>
        <h2 id="includes-title" className="section-title max-w-xl">What you get with each exam.</h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, name, text }) => (
            <li key={name} className="border-t-2 border-primary pt-5">
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">{name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
