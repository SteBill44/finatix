import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuizWithQuestions, QuizQuestion } from "@/hooks/useQuizzes";
import { useSubmitQuiz } from "@/hooks/useSubmitQuiz";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import QuestionRenderer, { Answer, isAnswerCorrect } from "@/components/quiz/QuestionRenderer";
import QuizFocusHeader from "@/components/quiz/QuizFocusHeader";
import QuestionProgressGrid from "@/components/quiz/QuestionProgressGrid";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCcw,
  Home,
  GraduationCap,
} from "lucide-react";

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quiz, questions, isLoading, refetchQuestions } = useQuizWithQuestions(quizId || "");
  const submitQuiz = useSubmitQuiz();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, Answer>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNext = useCallback(() => {
    setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const handlePrevious = useCallback(() => {
    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation: arrow keys move between questions (ignored while typing)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (showResults) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrevious();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrevious, showResults]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
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
      </Layout>
    );
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswered = selectedAnswers[currentQuestion] !== undefined;
  const answeredCount = Object.keys(selectedAnswers).length;
  const exitPath = quiz.lesson_id ? `/lesson/${quiz.lesson_id}` : "/dashboard";

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (isAnswerCorrect(q as any, selectedAnswers[index])) {
        correct++;
      }
    });
    return correct;
  };

  const handleAnswerChange = (answer: Answer) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to save your results");
      navigate("/auth");
      return;
    }

    setSubmitted(true);
    setShowResults(true);

    try {
      // Submit quiz to server for secure scoring
      const result = await submitQuiz.mutateAsync({
        quizId: quiz.id,
        answers: selectedAnswers,
      });
      // Refetch questions to get correct answers now that attempt is recorded
      await refetchQuestions();
      toast.success(`Quiz completed! You scored ${result.score}/${result.maxScore} (${result.percentage}%)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit quiz";
      toast.error(errorMessage);
      // Reset state on error so user can try again
      setSubmitted(false);
      setShowResults(false);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setSubmitted(false);
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  // Helper to render result for each question type
  const renderQuestionResult = (q: QuizQuestion, index: number) => {
    const userAnswer = selectedAnswers[index];
    const correct = isAnswerCorrect(q as any, userAnswer);

    return (
      <Card key={q.id} className="p-6">
        <div className="flex items-start gap-3 mb-4">
          {correct ? (
            <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-medium text-foreground mb-1">
              {index + 1}. {q.question}
            </p>
            <span className="text-xs text-muted-foreground capitalize">
              {q.question_type.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="ml-9">
          <QuestionRenderer
            question={q as any}
            answer={userAnswer}
            onAnswerChange={() => {}}
            showResult={true}
            isCorrect={correct}
            disabled={true}
          />
          {q.explanation && (
            <p className="text-sm text-muted-foreground mt-4 p-3 bg-secondary/30 rounded-lg">
              <strong>Explanation:</strong> {q.explanation}
            </p>
          )}
        </div>
      </Card>
    );
  };

  if (showResults) {
    return (
      <Layout>
        <section className="pt-24 lg:pt-28 pb-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="p-8 text-center mb-8 animate-scale-in">
              <Trophy className="w-12 h-12 mx-auto text-primary mb-4" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                Quiz Complete!
              </h1>
              <p className="text-muted-foreground mb-6">{quiz.title}</p>

              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{percentage}%</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                You scored {score} out of {questions.length}
              </h2>
              <p className="text-muted-foreground mb-6">
                {percentage >= 80
                  ? "Excellent work! You've mastered this material."
                  : percentage >= 60
                  ? "Good job! Review the questions you missed to improve."
                  : "Keep studying! Review the material and try again."}
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleRetry} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retry Quiz
                </Button>
                <Button onClick={() => navigate(exitPath)} className="gap-2">
                  <Home className="w-4 h-4" />
                  {quiz.lesson_id ? "Back to Lesson" : "Dashboard"}
                </Button>
              </div>
            </Card>

            <h3 className="text-xl font-semibold text-foreground mb-4">Review Answers</h3>
            <div className="space-y-4">
              {questions.map((q, index) => renderQuestionResult(q, index))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Full-screen focus mode ──
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <QuizFocusHeader
        title={quiz.title}
        exitTo={exitPath}
        current={currentQuestion + 1}
        total={questions.length}
        right={
          <Link to={`/exam/${quizId}`}>
            <Button variant="outline" size="sm" className="gap-1.5 hidden sm:inline-flex">
              <GraduationCap className="w-4 h-4" />
              Exam Mode
            </Button>
          </Link>
        }
      />

      {/* Question area - maximized */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-3xl">
          <div key={currentQuestion} className="animate-fade-in">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 capitalize">
              {question.question_type.replace('_', ' ')}
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-8 leading-snug">
              {question.question}
            </h2>

            <QuestionRenderer
              question={question as any}
              answer={selectedAnswers[currentQuestion] ?? null}
              onAnswerChange={handleAnswerChange}
              showResult={false}
              disabled={submitted}
            />
          </div>
        </div>
      </main>

      {/* Sticky bottom navigation */}
      <footer className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border safe-area-bottom">
        <div className="container mx-auto px-4 py-3 max-w-3xl space-y-3">
          <QuestionProgressGrid
            total={questions.length}
            currentIndex={currentQuestion}
            isAnswered={(i) => selectedAnswers[i] !== undefined}
            onSelect={setCurrentQuestion}
          />

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
              aria-label="Previous question"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <p className="text-xs text-muted-foreground">
              {answeredCount}/{questions.length} answered
            </p>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={answeredCount !== questions.length || submitted}
                className="gap-2"
              >
                Submit
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!hasAnswered} className="gap-2" aria-label="Next question">
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
