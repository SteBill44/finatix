import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { EXAM_GROUPS, examName } from "@/lib/examPresentation";
import { Button } from "@/components/ui/button";

export default function ExamDirectory({ standalone = false }: { standalone?: boolean }) {
  return <section id="levels" aria-labelledby="exam-directory-title" className="exam-directory section-space scroll-mt-24">
    <div className="container px-5 md:px-8">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="eyebrow">The complete qualification</p><h2 id="exam-directory-title" className="section-title">Find your next exam.</h2></div>
        <p className="max-w-sm text-muted-foreground">Sixteen exams. Four levels. One place to keep moving forward.</p>
      </div>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        {EXAM_GROUPS.map(({ level, label, exams }, index) => <div key={level} className="min-w-0">
          <div className="mb-3 flex items-center justify-between border-t-2 border-foreground pt-4">
            <Link to={`/courses?level=${level}`} className="font-display text-xl font-medium hover:text-primary">{label}</Link>
            <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
          </div>
          <div className="divide-y divide-border">
            {exams.map((exam) => <Link key={exam.code} to={`/courses/${exam.courseSlug}`} className="exam-directory-link group">
              <span className="exam-code">{exam.code}</span>
              <span className="min-w-0 flex-1 text-sm font-medium leading-snug">{examName(exam)}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none" aria-hidden="true" />
            </Link>)}
          </div>
        </div>)}
      </div>
      {!standalone && <div className="mt-9 flex flex-col justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">Certificate courses are free with an account.</p>
        <Button asChild trace variant="outline"><Link to="/courses">Browse all exams <ArrowRight /></Link></Button>
      </div>}
    </div>
  </section>;
}
