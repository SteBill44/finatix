import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  ClipboardList, 
  GraduationCap,
  Play,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
}

interface CourseSideNavProps {
  courseId: string;
  lessons: Lesson[];
  quizzes: Quiz[];
  lessonProgress?: { lesson_id: string; completed: boolean }[];
  levelColor?: string;
}

const CourseSideNav = ({ 
  courseId, 
  lessons, 
  quizzes, 
  lessonProgress,
  levelColor = "text-primary"
}: CourseSideNavProps) => {
  const [openSections, setOpenSections] = useState<string[]>(["lessons"]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress?.some(p => p.lesson_id === lessonId && p.completed);
  };

  const isSectionOpen = (section: string) => openSections.includes(section);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Course Content</h3>
      </div>

      {/* Lessons Section */}
      <div className="border-b border-border">
        <button
          onClick={() => toggleSection("lessons")}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className={cn("w-5 h-5", levelColor)} />
            <span className="font-medium text-foreground">Lessons</span>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {lessons.length}
            </span>
          </div>
          {isSectionOpen("lessons") ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {isSectionOpen("lessons") && (
          <div className="px-2 pb-2 max-h-64 overflow-y-auto">
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => {
                const completed = isLessonCompleted(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    to={`/courses/${courseId}/lesson/${lesson.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      {completed ? (
                        <CheckCircle className={cn("w-3.5 h-3.5", levelColor)} />
                      ) : (
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration_minutes} min
                      </p>
                    </div>
                    <Play className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground p-2">No lessons available</p>
            )}
          </div>
        )}
      </div>

      {/* Quizzes Section */}
      {quizzes.length > 0 && (
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection("quizzes")}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ClipboardList className={cn("w-5 h-5", levelColor)} />
              <span className="font-medium text-foreground">Quizzes</span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {quizzes.length}
              </span>
            </div>
            {isSectionOpen("quizzes") ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {isSectionOpen("quizzes") && (
            <div className="px-2 pb-2 max-h-64 overflow-y-auto">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  to={`/quiz/${quiz.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {quiz.title}
                    </p>
                    <p className="text-xs text-muted-foreground">Practice Quiz</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mock Exams Section */}
      {quizzes.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection("mockExams")}
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <GraduationCap className={cn("w-5 h-5", levelColor)} />
              <span className="font-medium text-foreground">Mock Exams</span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {quizzes.length}
              </span>
            </div>
            {isSectionOpen("mockExams") ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {isSectionOpen("mockExams") && (
            <div className="px-2 pb-2 max-h-64 overflow-y-auto">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  to={`/mock-exam/${quiz.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {quiz.title}
                    </p>
                    <p className="text-xs text-muted-foreground">Full Exam Simulation</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseSideNav;
