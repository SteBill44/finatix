import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuizWithQuestions, QuizQuestion } from "@/hooks/useQuizzes";
import { useRecordQuizAttempt } from "@/hooks/useStudentProgress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import QuestionRenderer, { Answer, isAnswerCorrect } from "@/components/quiz/QuestionRenderer";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCcw,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quiz, questions, isLoading, refetchQuestions } = useQuizWithQuestions(quizId || "");
  const recordAttempt = useRecordQuizAttempt();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, Answer>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
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
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswered = selectedAnswers[currentQuestion] !== undefined;

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

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to save your results");
      navigate("/auth");
      return;
    }

    const score = calculateScore();
    setSubmitted(true);
    setShowResults(true);

    try {
      await recordAttempt.mutateAsync({
        courseId: quiz.course_id,
        score,
        maxScore: questions.length,
      });
      // Refetch questions to get correct answers now that attempt is recorded
      await refetchQuestions();
      toast.success("Quiz completed! Your score has been saved.");
    } catch (error) {
      toast.error("Failed to save score, but you can see your results.");
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
            <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" />
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
        <section className="relative py-12 lg:py-16 overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-95" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <Trophy className="w-16 h-16 mx-auto text-primary-foreground mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
              Quiz Complete!
            </h1>
            <p className="text-primary-foreground/70">{quiz.title}</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 40" fill="none" className="w-full">
              <path d="M0 40L1440 40L1440 0C1200 30 720 40 0 15L0 40Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="p-8 text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
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
                <Button onClick={() => navigate("/dashboard")} className="gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
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

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-8 lg:py-12 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-95" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <Link to={`/exam/${quizId}`}>
              <Button variant="secondary" size="sm" className="gap-2">
                🎓 CIMA Exam Mode
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-primary-foreground/70">{quiz.description}</p>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full">
            <path d="M0 40L1440 40L1440 0C1200 30 720 40 0 15L0 40Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Quiz Content */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="p-8 mb-8">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-semibold text-foreground">
                {question.question}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6 capitalize">
              {question.question_type.replace('_', ' ')}
            </p>

            <QuestionRenderer
              question={question as any}
              answer={selectedAnswers[currentQuestion] ?? null}
              onAnswerChange={handleAnswerChange}
              showResult={false}
              disabled={submitted}
            />
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2 flex-wrap justify-center">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm font-medium transition-colors",
                    currentQuestion === index
                      ? "bg-primary text-primary-foreground"
                      : selectedAnswers[index] !== undefined
                      ? "bg-accent/20 text-accent"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length !== questions.length}
                className="gap-2"
              >
                Submit Quiz
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!hasAnswered} className="gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Quiz;
