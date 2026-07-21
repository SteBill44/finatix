import { Card } from "@/components/ui/card";
import { Trophy, ClipboardList, GraduationCap, Award } from "lucide-react";
import { AssessmentGroup } from "./AssessmentGroup";
import type { AssessmentItem } from "./helpers";
import { PASS_THRESHOLD, getScoreColor } from "./helpers";

interface Props {
  practiceQuizzes: AssessmentItem[];
  mockExams: AssessmentItem[];
  finalExams: AssessmentItem[];
  onLaunch: (item: AssessmentItem) => void;
}

export const AssessmentsPanel = ({
  practiceQuizzes,
  mockExams,
  finalExams,
  onLaunch,
}: Props) => {
  const total = practiceQuizzes.length + mockExams.length + finalExams.length;
  if (total === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          Assessments
        </div>
        <span className="text-[10px] text-muted-foreground">
          Pass ≥ {PASS_THRESHOLD}%
        </span>
      </div>

      <div className="space-y-2">
        {practiceQuizzes.length > 0 && (
          <AssessmentGroup
            label="Practice Quizzes"
            icon={<ClipboardList className="w-3 h-3" />}
            items={practiceQuizzes}
            onLaunch={(item) => onLaunch(item as AssessmentItem)}
            getScoreColor={getScoreColor}
          />
        )}

        {mockExams.length > 0 && (
          <AssessmentGroup
            label="Mock Exams"
            icon={<GraduationCap className="w-3 h-3" />}
            items={mockExams}
            onLaunch={(item) => onLaunch(item as AssessmentItem)}
            getScoreColor={getScoreColor}
          />
        )}

        {finalExams.length > 0 && (
          <AssessmentGroup
            label="Final Exam"
            icon={<Award className="w-3 h-3" />}
            items={finalExams}
            onLaunch={(item) => onLaunch(item as AssessmentItem)}
            getScoreColor={getScoreColor}
            highlight
            defaultOpen={false}
          />
        )}
      </div>
    </Card>
  );
};
