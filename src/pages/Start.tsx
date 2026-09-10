import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, FileText, Sparkles } from "lucide-react";
import { journeyAnalytics } from "@/lib/analytics";
import { skipJourneySelector } from "@/lib/learningContext";

const OPTIONS = [
  {
    id: "new" as const,
    to: "/start/new",
    icon: Sparkles,
    title: "I'm new to CIMA",
    text: "See how the qualification is structured and start with the free Certificate courses.",
  },
  {
    id: "paper" as const,
    to: "/start/paper",
    icon: BookOpen,
    title: "I'm studying for a paper",
    text: "Pick your paper and open its outcomes, sample content and access terms.",
  },
  {
    id: "case-study" as const,
    to: "/start/case-study",
    icon: FileText,
    title: "I'm preparing for a case study",
    text: "Choose your level and see the case study preparation we currently publish.",
  },
];

const Start = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <SEOHead
        title="Where are you starting from?"
        description="Choose your starting point on Finatix: new to CIMA, studying for a paper, or preparing for a case study."
      />
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Where are you starting from?
          </h1>
          <p className="mt-3 text-muted-foreground">
            Three questions at most. We'll take you straight to the right content.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
          {OPTIONS.map(({ id, to, icon: Icon, title, text }) => (
            <Link
              key={id}
              to={to}
              onClick={() => journeyAnalytics.selected({ journey: id })}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/60 hover:bg-secondary/40 focus-visible:border-primary"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Continue
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              skipJourneySelector();
              journeyAnalytics.skipped({ from: "/start" });
              navigate("/courses");
            }}
          >
            Skip this - just show me all the courses
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Start;
