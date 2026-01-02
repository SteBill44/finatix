import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuizWithQuestions } from "@/hooks/useQuizzes";
import { useRecordQuizAttempt } from "@/hooks/useStudentProgress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ExamCalculator from "@/components/quiz/ExamCalculator";
import ExamTimer from "@/components/quiz/ExamTimer";
import QuestionNavigator from "@/components/quiz/QuestionNavigator";
import FocusMonitor from "@/components/quiz/FocusMonitor";
import FormulaSheet from "@/components/quiz/FormulaSheet";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCcw,
  Home,
  Calculator,
  Flag,
  List,
  AlertCircle,
  Clock,
  FileText,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ExamType = "objective" | "case_study" | null;

const MockExam = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quiz, questions, isLoading, refetchQuestions } = useQuizWithQuestions(quizId || "");
  const recordAttempt = useRecordQuizAttempt();

  // Exam setup state
  const [examType, setExamType] = useState<ExamType>(null);
  const [examStarted, setExamStarted] = useState(false);
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  
  // Focus monitoring
  const [focusViolations, setFocusViolations] = useState(0);

  // Exam durations in minutes
  const OBJECTIVE_DURATION = 90; // 90 minutes
  const CASE_STUDY_DURATION = 180; // 3 hours

  const examDuration = examType === "case_study" ? CASE_STUDY_DURATION : OBJECTIVE_DURATION;

  const handleTimeUp = useCallback(() => {
    setShowTimeUpDialog(true);
  }, []);

  const handleForceSubmit = async () => {
    setShowTimeUpDialog(false);
    await handleSubmit();
  };

  const handleFocusViolation = (count: number) => {
    setFocusViolations(count);
  };

  const startExam = (type: ExamType) => {
    setExamType(type);
    setExamStarted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-2">Quiz Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This quiz doesn't exist or has no questions.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Exam Type Selection Screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Link
            to={`/quiz/${quizId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Practice Mode
          </Link>

          <Card className="p-8">
            <div className="text-center mb-8">
              <GraduationCap className="w-16 h-16 mx-auto text-primary mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                CIMA Mock Exam
              </h1>
              <p className="text-muted-foreground">
                {quiz.title}
              </p>
            </div>

            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-1">Exam Conditions</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Focus monitoring is enabled - leaving the window will be recorded</li>
                    <li>• Timer cannot be paused once started</li>
                    <li>• Answers will auto-submit when time expires</li>
                    <li>• Calculator provided is non-programmable</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-foreground mb-4">
              Select Exam Type
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Objective Test */}
              <button
                onClick={() => startExam("objective")}
                className="p-6 rounded-xl border-2 border-border hover:border-primary bg-card transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Objective Test</h3>
                    <p className="text-sm text-muted-foreground">OT Exam Format</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    90 minutes
                  </span>
                  <span>{questions.length} questions</span>
                </div>
              </button>

              {/* Case Study */}
              <button
                onClick={() => startExam("case_study")}
                className="p-6 rounded-xl border-2 border-border hover:border-primary bg-card transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Case Study</h3>
                    <p className="text-sm text-muted-foreground">CS Exam Format</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    3 hours
                  </span>
                  <span>{questions.length} questions</span>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answeredQuestions = new Set(Object.keys(selectedAnswers).map(Number));
  const unansweredCount = questions.length - answeredQuestions.size;
  const flaggedCount = flaggedQuestions.size;

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to save your results");
      navigate("/auth");
      return;
    }

    const score = calculateScore();
    setSubmitted(true);
    setShowResults(true);
    setShowSubmitDialog(false);

    try {
      await recordAttempt.mutateAsync({
        courseId: quiz.course_id,
        score,
        maxScore: questions.length,
      });
      await refetchQuestions();
      toast.success("Mock exam completed! Your score has been saved.");
    } catch (error) {
      toast.error("Failed to save score, but you can see your results.");
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentQuestion(0);
    setShowResults(false);
    setSubmitted(false);
    setExamStarted(false);
    setExamType(null);
    setFocusViolations(0);
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        {/* Results Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 py-12 text-center">
          <Trophy className="w-16 h-16 mx-auto text-primary-foreground mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            Mock Exam Complete!
          </h1>
          <p className="text-primary-foreground/70">{quiz.title}</p>
          <p className="text-primary-foreground/60 text-sm mt-1">
            {examType === "case_study" ? "Case Study" : "Objective Test"} Format
          </p>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Score Card */}
          <Card className="p-8 text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-4xl font-bold text-foreground">{percentage}%</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              You scored {score} out of {questions.length}
            </h2>
            <p className="text-muted-foreground mb-4">
              {percentage >= 80
                ? "Excellent work! You've mastered this material."
                : percentage >= 60
                ? "Good job! Review the questions you missed to improve."
                : "Keep studying! Review the material and try again."}
            </p>

            {/* Focus Violations Summary */}
            {focusViolations > 0 && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Focus violations detected: {focusViolations}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You left the exam window {focusViolations} time(s) during the exam.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleRetry} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Retry Exam
              </Button>
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            </div>
          </Card>

          {/* Review Section */}
          <h3 className="text-xl font-semibold text-foreground mb-4">Review Answers</h3>
          <div className="space-y-4">
            {questions.map((q, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === q.correct_answer;
              const wasFlagged = flaggedQuestions.has(index);

              return (
                <Card key={q.id} className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {index + 1}. {q.question}
                        </p>
                        {wasFlagged && (
                          <Flag className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 ml-9">
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={cn(
                          "p-3 rounded-lg text-sm",
                          optIndex === q.correct_answer
                            ? "bg-accent/10 text-accent border border-accent/20"
                            : optIndex === userAnswer && !isCorrect
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-secondary/50 text-muted-foreground"
                        )}
                      >
                        {option}
                        {optIndex === q.correct_answer && (
                          <span className="ml-2 text-xs font-medium">(Correct)</span>
                        )}
                        {optIndex === userAnswer && optIndex !== q.correct_answer && (
                          <span className="ml-2 text-xs font-medium">(Your answer)</span>
                        )}
                      </div>
                    ))}
                    {q.explanation && (
                      <p className="text-sm text-muted-foreground mt-3 p-3 bg-secondary/30 rounded-lg">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Exam Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left - Quiz Info */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="font-semibold text-foreground line-clamp-1">
                  {quiz.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {examType === "case_study" ? "Case Study" : "Objective Test"} • Mock Exam
                </p>
              </div>
            </div>

            {/* Center - Timer & Focus */}
            <div className="flex items-center gap-3">
              <ExamTimer
                initialMinutes={examDuration}
                onTimeUp={handleTimeUp}
                isPaused={submitted}
              />
              <FocusMonitor
                isActive={!submitted}
                onViolation={handleFocusViolation}
              />
            </div>

            {/* Right - Tools */}
            <div className="flex items-center gap-2">
              <Button
                variant={showFormulaSheet ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFormulaSheet(!showFormulaSheet)}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Formulae</span>
              </Button>
              <Button
                variant={showCalculator ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
                className="gap-2"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">Calculator</span>
              </Button>
              <Button
                variant={showNavigator ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNavigator(!showNavigator)}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Navigator</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Question Area */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <Button
                variant={flaggedQuestions.has(currentQuestion) ? "default" : "outline"}
                size="sm"
                onClick={handleToggleFlag}
                className={cn(
                  "gap-2",
                  flaggedQuestions.has(currentQuestion) && "bg-yellow-500 hover:bg-yellow-600"
                )}
              >
                <Flag
                  className={cn(
                    "w-4 h-4",
                    flaggedQuestions.has(currentQuestion) && "fill-current"
                  )}
                />
                {flaggedQuestions.has(currentQuestion) ? "Flagged" : "Flag for Review"}
              </Button>
            </div>

            {/* Question Card */}
            <Card className="p-8 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {question.question}
              </h2>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={submitted}
                    className={cn(
                      "w-full p-4 text-left rounded-xl border-2 transition-all",
                      selectedAnswers[currentQuestion] === index
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                          selectedAnswers[currentQuestion] === index
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-foreground">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    className="gap-2"
                  >
                    Submit Exam
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="gap-2">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Side Panel - Navigator */}
        {showNavigator && (
          <aside className="w-80 border-l border-border bg-card p-6 hidden lg:block">
            <QuestionNavigator
              totalQuestions={questions.length}
              currentQuestion={currentQuestion}
              answeredQuestions={answeredQuestions}
              flaggedQuestions={flaggedQuestions}
              onNavigate={setCurrentQuestion}
            />

            <div className="mt-6 pt-6 border-t border-border">
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="w-full gap-2"
              >
                Submit Exam
                <CheckCircle className="w-4 h-4" />
              </Button>
            </div>
          </aside>
        )}
      </div>

      {/* Calculator */}
      {showCalculator && (
        <ExamCalculator onClose={() => setShowCalculator(false)} />
      )}

      {/* Formula Sheet */}
      {showFormulaSheet && (
        <FormulaSheet examLevel="BA1" onClose={() => setShowFormulaSheet(false)} />
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Mock Exam?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to submit your exam?</p>
              {unansweredCount > 0 && (
                <p className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="w-4 h-4" />
                  You have {unansweredCount} unanswered question(s).
                </p>
              )}
              {flaggedCount > 0 && (
                <p className="flex items-center gap-2 text-yellow-600">
                  <Flag className="w-4 h-4" />
                  You have {flaggedCount} flagged question(s) for review.
                </p>
              )}
              {focusViolations > 0 && (
                <p className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {focusViolations} focus violation(s) recorded.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
      <AlertDialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Time's Up!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your exam time has expired. Your answers will now be submitted automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleForceSubmit}>
              View Results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MockExam;
