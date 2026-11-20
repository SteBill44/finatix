import { Link } from "react-router-dom";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EXAM_GROUPS, examName } from "@/lib/examPresentation";
export default function ExamsMenu({ active = false }: { active?: boolean }) {
  return <DropdownMenu modal={false}><DropdownMenuTrigger asChild><Button variant="ghost" className={active ? "px-2 text-primary" : "px-2 text-muted-foreground"}>Exams<ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="start" sideOffset={15} className="w-[min(900px,calc(100vw-32px))] p-6">
      <div className="mb-5 flex items-center justify-between border-b border-border pb-4"><span className="font-display text-lg font-medium">The CIMA exam catalogue</span><DropdownMenuItem asChild><Link to="/courses" className="gap-2 text-primary">All exams<ArrowUpRight className="h-4 w-4" /></Link></DropdownMenuItem></div>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">{EXAM_GROUPS.map(({ level, label, exams }) => <div key={level}><DropdownMenuItem asChild><Link to={`/courses?level=${level}`} className="mb-3 font-semibold">{label}</Link></DropdownMenuItem>{exams.map((exam) => <DropdownMenuItem key={exam.code} asChild><Link to={`/courses/${exam.courseSlug}`} className="items-start gap-2 py-2"><span className="w-8 shrink-0 text-xs font-semibold text-primary">{exam.code}</span><span className="text-xs leading-snug">{examName(exam)}</span></Link></DropdownMenuItem>)}</div>)}</div>
    </DropdownMenuContent>
  </DropdownMenu>;
}
