import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { title: "Find your exam", text: "Browse by qualification level and choose the exam you are working towards.", to: "/courses", action: "Browse exams" },
  { title: "Create your account", text: "Keep your courses, personal notes and progress together. Certificate courses are free with an account.", to: "/auth?mode=signup", action: "Create an account" },
  { title: "Return to your study", text: "Open your dashboard to continue your enrolled courses and review your saved lesson and quiz progress.", to: "/dashboard", action: "Open your dashboard" },
];

export default function GettingStarted() {
  return (
    <section aria-labelledby="getting-started-title" className="section-space bg-background">
      <div className="container grid gap-12 px-5 md:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <p className="eyebrow">Getting started</p>
          <h2 id="getting-started-title" className="section-title max-w-md">Your next step starts here.</h2>
          <p className="mt-5 max-w-sm text-lg text-muted-foreground">Start at the level that fits your CIMA studies. Keep everything that follows in one place.</p>
          <Button asChild trace variant="outline" className="mt-7"><Link to="/start">Find where to start <ArrowRight /></Link></Button>
        </div>
        <ol className="divide-y divide-border border-y border-border">
          {STEPS.map(({ title, text, to, action }, index) => (
            <li key={title} className="grid grid-cols-[40px_1fr] gap-5 py-8">
              <span className="font-mono text-lg text-primary" aria-hidden="true">0{index + 1}</span>
              <div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-muted-foreground">{text}</p>
                <Link to={to} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:text-primary">{action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}