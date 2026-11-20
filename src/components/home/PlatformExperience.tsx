import { Link } from "react-router-dom";
import { BookOpen, Layers, ChartNoAxesCombined, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOOLS = [
  { icon: BookOpen, name: "Syllabus-organised lessons", text: "Your exam content, organised by topic. Reading, resources and practice stay connected to the course you're studying.", to: "/courses", action: "Explore exam content" },
  { icon: Layers, name: "Your revision workspace", text: "Keep personal lesson notes and revisit flashcards with spaced repetition, all within your Finatix account.", to: "/flashcards", action: "Open flashcards" },
  { icon: ChartNoAxesCombined, name: "Progress that stays with you", text: "Completed lessons and quiz results are saved to your account. Return to your course and see where to focus next.", to: "/dashboard", action: "Open your dashboard" },
];
export default function PlatformExperience() {
  return <section id="platform" aria-labelledby="platform-title" className="section-space border-y border-border bg-secondary/50 scroll-mt-24">
    <div className="container px-5 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div><p className="eyebrow">The Finatix platform</p><h2 id="platform-title" className="section-title max-w-md">Less searching.<br />More studying.</h2><p className="mt-5 max-w-sm text-lg text-muted-foreground">One connected workspace for the exam in front of you and everything that comes next.</p><Button asChild trace variant="outline" className="mt-7"><Link to="/auth?mode=signup">Create your account <ArrowUpRight /></Link></Button></div>
        <div className="divide-y divide-border border-y border-border">
          {TOOLS.map(({ icon: Icon, name, text, to, action }) => <div key={name} className="grid grid-cols-[32px_1fr] gap-5 py-7 first:pt-6">
            <Icon className="mt-1 h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden="true" />
            <div><h3 className="text-xl font-medium">{name}</h3><p className="mt-2 text-sm text-muted-foreground">{text}</p><Link to={to} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold hover:text-primary">{action}<ArrowUpRight className="h-4 w-4" /></Link></div>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}
