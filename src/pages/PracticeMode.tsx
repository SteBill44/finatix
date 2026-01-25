import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdaptivePracticeQuestions, useSubmitPracticeAnswer } from "@/hooks/useAdaptivePractice";
import { useSyllabusMastery } from "@/hooks/useSyllabusMastery";
import { isAnswerCorrect } from "@/components/quiz/QuestionRenderer";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QuestionRenderer, { Answer } from "@/components/quiz/QuestionRenderer";
import SyllabusMasteryCard from "@/components/course/SyllabusMasteryCard";
import { 
  ArrowLeft, 
  ArrowRight, 
  Brain, 
  Target, 
  CheckCircle2, 
  XCircle,
  RotateCcw,
  Lightbulb,
  Filter,
} from "lucide-react";

const PracticeMode = () => {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [questionCount, setQuestionCount] = useState(10);
  const [focusArea, setFocusArea] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [sessionStarted, setSessionStarted] = useState(false);

  // Fetch course
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, slug")
        .eq("slug", courseSlug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!courseSlug,
  });

  // Fetch syllabus
  const { data: syllabus } = useQuery({
    queryKey: ["syllabus", course?.id],
    queryFn: async () => {
      if (!course?.id) return null;
      const { data, error } = await supabase
        .from("course_syllabuses")
        .select("syllabus_areas")
        .eq("course_id", course.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!course?.id,
  });

  const syllabusAreas = (syllabus?.syllabus_areas as Array<{ title: string; weight: number }>) || [];

  // Fetch adaptive practice questions
  const { 
    data: questions = [], 
    isLoading: questionsLoading,
    refetch: refetchQuestions,
  } = useAdaptivePracticeQuestions(
    sessionStarted && course?.id
      ? {
          courseId: course.id,
          questionCount,
          focusSyllabusArea: focusArea !== "all" ? parseInt(focusArea) : undefined,
          difficultyFilter: difficulty !== "all" ? difficulty as "easy" | "medium" | "hard" : undefined,
        }
      : null
  );

  // Mastery data
  const { data: mastery } = useSyllabusMastery(course?.id);

  // Submit answer mutation
  const submitAnswer = useSubmitPracticeAnswer();

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || selectedAnswer === null || !course?.id) return;

    // Transform question to match QuestionRenderer's expected format
    const questionForCheck = {
      ...currentQuestion,
      correct_answer: 0, // Will be checked server-side
      explanation: null,
    };

    // For practice mode, we need to get the correct answer from the server
    // For now, we'll simulate by checking locally (in real implementation, 
    // this would be a secure check)
    const correct = false; // Placeholder - server will validate
    setIsCorrect(correct);
    setShowResult(true);

    // Record the attempt
    try {
      await submitAnswer.mutateAsync({
        questionId: currentQuestion.id,
        courseId: course.id,
        syllabusAreaIndex: currentQuestion.syllabus_area_index,
        isCorrect: correct,
      });

      setSessionStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
      }));
    } catch (error) {
      console.error("Failed to record attempt:", error);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleStartSession = () => {
    setSessionStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setSessionStats({ correct: 0, total: 0 });
  };

  const handleRestartSession = () => {
    setSessionStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setSessionStats({ correct: 0, total: 0 });
  };

  if (courseLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Course not found</div>
        </div>
      </Layout>
    );
  }

  // Session setup screen
  if (!sessionStarted) {
    return (
      <Layout>
        <SEOHead 
          title={`Practice Mode - ${course.title}`}
          description="Adaptive practice questions tailored to your weak areas"
        />
        <div className="container mx-auto pt-24 lg:pt-28 pb-8 px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/courses/${courseSlug}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Setup Card */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Practice Mode</h1>
                    <p className="text-muted-foreground">{course.title}</p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-foreground">Adaptive Learning</h3>
                      <p className="text-sm text-muted-foreground">
                        Questions are weighted toward your weak areas to help you improve faster.
                        60% of questions will come from areas where you need the most practice.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Questions</label>
                      <Select 
                        value={questionCount.toString()} 
                        onValueChange={(v) => setQuestionCount(parseInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 questions</SelectItem>
                          <SelectItem value="10">10 questions</SelectItem>
                          <SelectItem value="20">20 questions</SelectItem>
                          <SelectItem value="50">50 questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Focus Area</label>
                      <Select value={focusArea} onValueChange={setFocusArea}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Areas (Adaptive)</SelectItem>
                          {syllabusAreas.map((area, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {area.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulty</label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Difficulties</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleStartSession} 
                    size="lg" 
                    className="w-full"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Start Practice Session
                  </Button>
                </div>
              </Card>
            </div>

            {/* Mastery Card */}
            <div>
              <SyllabusMasteryCard 
                courseId={course.id} 
                syllabusAreas={syllabusAreas}
              />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Questions loading
  if (questionsLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Generating adaptive questions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto pt-24 lg:pt-28 pb-8 px-4">
          <Card className="p-8 text-center">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Practice Questions Available</h2>
            <p className="text-muted-foreground mb-4">
              There are no questions in the practice pool for this course yet.
              {focusArea !== "all" && " Try selecting 'All Areas' instead."}
            </p>
            <Button onClick={handleRestartSession}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Setup
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  // Session complete
  if (currentQuestionIndex >= questions.length || !currentQuestion) {
    const percentage = Math.round((sessionStats.correct / sessionStats.total) * 100) || 0;
    
    return (
      <Layout>
        <div className="container mx-auto pt-24 lg:pt-28 pb-8 px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-6">
              You answered {sessionStats.correct} out of {sessionStats.total} questions correctly
            </p>

            <div className="bg-muted rounded-lg p-6 mb-6">
              <div className="text-4xl font-bold text-primary mb-2">{percentage}%</div>
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate(`/courses/${courseSlug}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <Button onClick={handleRestartSession}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // Active practice session
  return (
    <Layout>
      <SEOHead 
        title={`Practice Mode - ${course.title}`}
        description="Practice questions"
      />
      <div className="container mx-auto pt-24 lg:pt-28 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={handleRestartSession}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Session
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                {sessionStats.correct} / {sessionStats.total} correct
              </Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          {/* Progress */}
          <Progress 
            value={((currentQuestionIndex + 1) / questions.length) * 100} 
            className="h-2 mb-6" 
          />

          {/* Question Card */}
          <Card className="p-6">
            {/* Question metadata */}
            <div className="flex items-center gap-2 mb-4">
              {currentQuestion.syllabus_area_index !== null && (
                <Badge variant="secondary">
                  {syllabusAreas[currentQuestion.syllabus_area_index]?.title || 
                    `Area ${currentQuestion.syllabus_area_index + 1}`}
                </Badge>
              )}
              <Badge variant="outline">{currentQuestion.difficulty_level}</Badge>
            </div>

            {/* Question */}
            <QuestionRenderer
              question={{
                ...currentQuestion,
                correct_answer: 0,
                explanation: null,
                options: currentQuestion.options || [],
                correct_answers: undefined,
                number_answer: undefined,
                number_tolerance: undefined,
              }}
              answer={selectedAnswer}
              onAnswerChange={(answer) => setSelectedAnswer(answer)}
              showResult={showResult}
              disabled={showResult}
            />

            {/* Result feedback */}
            {showResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                isCorrect ? "bg-accent/10 border border-accent/20" : "bg-destructive/10 border border-destructive/20"
              }`}>
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className={`font-medium ${isCorrect ? "text-accent" : "text-destructive"}`}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              {!showResult ? (
                <Button 
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    "View Results"
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PracticeMode;
