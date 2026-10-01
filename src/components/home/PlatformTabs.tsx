import { useRef, useState, type KeyboardEvent } from "react";
import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import { useBa1Outline } from "./HeroPreview";

// A real BA1 question (wording only, no calculation), shown as a static picture.
const SAMPLE = {
  question: "A market with many sellers and differentiated products is called:",
  options: ["Perfect competition", "Monopoly", "Monopolistic competition", "Oligopoly"],
  correct: 2,
  chosen: 3,
  explanation:
    "Monopolistic competition features many sellers with differentiated products and relatively free entry/exit.",
};

const TABS = [
  { id: "explore", label: "Explore", blurb: "See every lesson in the CIMA syllabus order before you sign up." },
  { id: "practise", label: "Practise", blurb: "Short lesson quizzes, marked the moment you finish." },
  { id: "review", label: "Review", blurb: "Every answer explained, so a wrong answer still teaches you something." },
] as const;
type TabId = (typeof TABS)[number]["id"];

const Panel = ({ id }: { id: TabId }) => {
  const { data } = useBa1Outline();
  if (id === "explore") {
    return (
      <ol className="grid gap-2 sm:grid-cols-2">
        {(data?.lessons ?? []).map((l, i) => (
          <li key={l.id} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <span className="w-6 text-right text-xs font-semibold text-muted-foreground">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-foreground">{l.title}</span>
            <ClipboardList className="h-4 w-4 flex-shrink-0 text-primary" aria-label="Has a quiz" />
          </li>
        ))}
        {!data && <li className="text-sm text-muted-foreground">Loading the BA1 outline...</li>}
      </ol>
    );
  }
  const review = id === "review";
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-border bg-background p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">BA1 lesson quiz · example question</p>
      <p className="mt-2 text-lg font-medium text-foreground">{SAMPLE.question}</p>
      <ul className="mt-4 space-y-2">
        {SAMPLE.options.map((o, i) => {
          const isCorrect = review && i === SAMPLE.correct;
          const isWrong = review && i === SAMPLE.chosen;
          return (
            <li
              key={o}
              className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
                isCorrect
                  ? "border-primary bg-primary/10 text-foreground"
                  : isWrong
                    ? "border-destructive/60 bg-destructive/10 text-foreground"
                    : "border-border text-foreground"
              }`}
            >
              {o}
              {isCorrect && <CheckCircle2 className="h-4 w-4 text-primary" aria-label="Correct answer" />}
              {isWrong && <XCircle className="h-4 w-4 text-destructive" aria-label="Chosen answer" />}
            </li>
          );
        })}
      </ul>
      {review ? (
        <div className="mt-4 rounded-lg border-l-2 border-primary bg-secondary/50 p-4">
          <p className="text-sm font-semibold text-foreground">Why</p>
          <p className="mt-1 text-sm text-muted-foreground">{SAMPLE.explanation}</p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">Answer all ten, submit, and the quiz is marked straight away.</p>
      )}
    </div>
  );
};

/** Explore / Practise / Review — manual tabs, keyboard accessible, no auto-rotation. */
const PlatformTabs = () => {
  const [active, setActive] = useState<TabId>("explore");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, i: number) => {
    const n = TABS.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % n;
    if (e.key === "ArrowLeft") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(TABS[next].id);
    refs.current[next]?.focus();
  };

  const current = TABS.find((t) => t.id === active)!;

  return (
    <section id="platform" aria-labelledby="platform-heading" className="scroll-mt-20 bg-card py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The platform</p>
          <h2 id="platform-heading" className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What studying on Finatix looks like
          </h2>
        </div>

        <div role="tablist" aria-label="Platform preview" className="mx-auto mb-3 flex w-fit gap-1 rounded-full border border-border bg-background p-1">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => (refs.current[i] = el)}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={active === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={active === t.id ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
                active === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mb-8 text-center text-sm text-muted-foreground">{current.blurb}</p>

        <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} tabIndex={0} className="mx-auto max-w-5xl focus-visible:outline-none">
          <Panel id={active} />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          Lesson notes, mock exams and topic-by-topic feedback are being built and aren't available yet.
        </p>
      </div>
    </section>
  );
};

export default PlatformTabs;
