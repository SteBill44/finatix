import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A real question from the free BA1 course, taken from the platform's own
 * question bank, with the platform's own explanation. Nothing here is invented:
 * the question, the options, the correct answer, the explanation and the
 * follow-on lesson are all real records in the course.
 */

const FREE_COURSE_SLUG = "ba1-business-economics";
const FREE_COURSE_PATH = `/courses/${FREE_COURSE_SLUG}`;

interface DemoQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const LESSON_TITLE = "Introduction to National Income";
const NEXT_LESSON_TITLE = "Economic Growth and Development";

const QUESTIONS: DemoQuestion[] = [
  {
    question: "What is the formula for GDP using the expenditure method?",
    options: [
      "C + I + G + (X - M)",
      "C + I + G - X + M",
      "C - I + G + X",
      "C + I - G + X - M",
    ],
    correctIndex: 0,
    explanation:
      "GDP = Consumption + Investment + Government Spending + (Exports - Imports)",
  },
  {
    question: "Which of the following is NOT included in GDP calculations?",
    options: [
      "Consumer spending",
      "Government purchases",
      "Intermediate goods",
      "Business investment",
    ],
    correctIndex: 2,
    explanation:
      "Intermediate goods are not counted in GDP to avoid double counting.",
  },
  {
    question: "What is the difference between nominal and real GDP?",
    options: [
      "Real GDP adjusts for inflation",
      "Nominal GDP adjusts for inflation",
      "There is no difference",
      "Real GDP only counts exports",
    ],
    correctIndex: 0,
    explanation:
      "Real GDP adjusts for inflation to show the true change in output over time.",
  },
];

interface TryQuestionProps {
  /** Fired the first time the visitor answers. No answer content is passed. */
  onStart?: () => void;
  /** Fired when they have answered every question in the sample. */
  onComplete?: () => void;
}

const TryQuestion = ({ onStart, onComplete }: TryQuestionProps = {}) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const question = QUESTIONS[index];
  const answered = selected !== null;
  const isCorrect = selected === question.correctIndex;
  const isLast = index === QUESTIONS.length - 1;

  const answer = (i: number) => {
    setSelected(i);
    if (!started) {
      setStarted(true);
      onStart?.();
    }
    const count = answeredCount + 1;
    setAnsweredCount(count);
    if (count === QUESTIONS.length) onComplete?.();
  };

  const next = () => {
    setSelected(null);
    setIndex((i) => (i + 1) % QUESTIONS.length);
  };


  return (
    <div className="rounded-2xl border border-border bg-card shadow-xl shadow-primary/5 overflow-hidden">
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/40 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            BA1 · Free course
          </p>
          <p className="truncate text-sm font-medium text-foreground">{LESSON_TITLE}</p>
        </div>
        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
          Question {index + 1} of {QUESTIONS.length}
        </span>
      </div>

      <div className="p-5">
        <fieldset>
          <legend className="mb-4 text-base font-semibold leading-snug text-foreground md:text-lg">
            {question.question}
          </legend>

          <div className="space-y-2.5">
            {question.options.map((option, i) => {
              const chosen = selected === i;
              const showCorrect = answered && i === question.correctIndex;
              const showWrong = chosen && !isCorrect;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => !answered && answer(i)}
                  disabled={answered}
                  aria-pressed={chosen}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${
                    showCorrect
                      ? "border-primary bg-primary/10 text-foreground"
                      : showWrong
                        ? "border-destructive/60 bg-destructive/10 text-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      showCorrect
                        ? "border-primary bg-primary text-primary-foreground"
                        : showWrong
                          ? "border-destructive bg-destructive text-destructive-foreground"
                          : "border-border text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  >
                    {showCorrect ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : showWrong ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Feedback + what comes next */}
        <div aria-live="polite">
          {answered && (
            <div className="mt-5 rounded-xl border border-border bg-secondary/40 p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2">
              <p className="text-sm font-semibold text-foreground">
                {isCorrect ? "Correct." : "Not quite."}{" "}
                <span className="font-normal text-muted-foreground">
                  Here's why:
                </span>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {question.explanation}
              </p>

              <div className="mt-4 border-t border-border pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Next in this course
                </p>
                <p className="mt-1 text-sm text-foreground">{NEXT_LESSON_TITLE}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Inside the course, practice questions are chosen based on the
                  topics you've been getting wrong.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button asChild size="sm" className="gap-1.5">
                  <Link to={FREE_COURSE_PATH}>
                    Open the free BA1 course
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={next}
                >
                  <RotateCcw className="h-4 w-4" />
                  {isLast ? "Start again" : "Try another question"}
                </Button>
              </div>
            </div>
          )}

          {!answered && (
            <p className="mt-4 text-xs text-muted-foreground">
              Pick an answer to see the explanation. No account needed for this one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TryQuestion;
