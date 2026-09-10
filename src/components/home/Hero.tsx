import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, MessageSquareText, PlayCircle, Target } from "lucide-react";
import TryQuestion from "./TryQuestion";

const FREE_COURSE_PATH = "/courses/ba1-business-economics";

const loop = [
  {
    icon: PlayCircle,
    title: "Learn the topic",
    text: "Short, structured lessons that follow the CIMA syllabus.",
  },
  {
    icon: Target,
    title: "Practise it",
    text: "Exam-style questions after every lesson, plus full mock exams.",
  },
  {
    icon: MessageSquareText,
    title: "See where you stand",
    text: "Every answer comes with an explanation, so revision time goes where it's needed.",
  },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-secondary/[0.38] pt-28 pb-14 lg:pt-32 lg:pb-20 -mt-16">
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-14">
          {/* Left: what this is, and how to start */}
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              CIMA training, start to chartered
            </p>

            <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight text-charcoal md:text-5xl lg:text-6xl dark:text-white">
              Learn CIMA by{" "}
              <span className="text-gradient-brand">answering real exam questions</span>
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-relaxed text-charcoal/80 dark:text-white/75">
              Finatix teaches every CIMA level through short lessons, exam-style
              practice and an explanation for every answer, so you always know
              which topic to study next instead of guessing.
            </p>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="xl" className="group shadow-lg shadow-primary/20">
                <Link to={FREE_COURSE_PATH}>
                  Start BA1 free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="group bg-background/70">
                <Link to="/courses">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore courses
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              The four Certificate-level courses (BA1-BA4) are free.{" "}
              <Link to="/why-cima" className="font-medium text-primary hover:underline">
                What is CIMA?
              </Link>
            </p>
          </div>

          {/* Right: a real question from the free course */}
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700">
            <h2 className="sr-only">Try a question from the free BA1 course</h2>
            <TryQuestion />
          </div>
        </div>

        {/* How the learning loop works */}
        <div className="mt-12 grid gap-4 border-t border-border/60 pt-8 sm:grid-cols-3 lg:mt-16">
          {loop.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
