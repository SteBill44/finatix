import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RotateCcw, Plus, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useFlashcards, useFlashcardDecks, useRecordFlashcardReview, useAddFlashcard, type Flashcard } from "@/hooks/useFlashcards";
import { toast } from "sonner";

export default function FlashcardStudy() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { data: cards = [], isLoading } = useFlashcards(deckId!);
  const { data: decks = [] } = useFlashcardDecks();
  const deck = decks.find((d) => d.id === deckId);
  const recordReview = useRecordFlashcardReview();
  const addCard = useAddFlashcard(deckId!);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [sessionDone, setSessionDone] = useState(false);

  const current = cards[currentIndex];
  const progress = cards.length > 0 ? (reviewed.size / cards.length) * 100 : 0;

  const handleFlip = () => setFlipped((f) => !f);

  const handleRate = useCallback(
    async (quality: number) => {
      if (!current) return;
      await recordReview.mutateAsync({
        flashcardId: current.id,
        quality,
        existingProgress: current.progress || null,
      });
      setFlipped(false);
      setReviewed((prev) => new Set([...prev, currentIndex]));
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setSessionDone(true);
      }
    },
    [current, currentIndex, cards.length, recordReview]
  );

  const handleAddCard = async () => {
    if (!front.trim() || !back.trim()) return;
    try {
      await addCard.mutateAsync({ front: front.trim(), back: back.trim() });
      toast.success("Card added");
      setAddOpen(false);
      setFront("");
      setBack("");
    } catch {
      toast.error("Failed to add card");
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setReviewed(new Set());
    setSessionDone(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <SEOHead title="Flashcard Study" noIndex />
        <div className="pt-24 lg:pt-28 pb-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title={deck ? `${deck.title} — Study` : "Flashcard Study"} noIndex />
      <div className="pt-24 lg:pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link to="/flashcards">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-lg">{deck?.title || "Study Session"}</h1>
                <p className="text-xs text-muted-foreground">{cards.length} cards</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Flashcard</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label>Front (question)</Label>
                      <Textarea
                        placeholder="Enter the question or term"
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Back (answer)</Label>
                      <Textarea
                        placeholder="Enter the answer or definition"
                        value={back}
                        onChange={(e) => setBack(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleAddCard}
                      disabled={!front.trim() || !back.trim() || addCard.isPending}
                    >
                      Add Card
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {cards.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground">This deck has no cards yet.</p>
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add First Card
                </Button>
              </CardContent>
            </Card>
          ) : sessionDone ? (
            <SessionComplete
              total={cards.length}
              onRestart={handleRestart}
              onBack={() => navigate("/flashcards")}
            />
          ) : (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{reviewed.size} / {cards.length} reviewed</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="mb-6 h-1.5" />

              {/* Card navigation */}
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentIndex === 0}
                  onClick={() => { setCurrentIndex((i) => i - 1); setFlipped(false); }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Card {currentIndex + 1} of {cards.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentIndex === cards.length - 1}
                  onClick={() => { setCurrentIndex((i) => i + 1); setFlipped(false); }}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Flashcard */}
              <div
                className="relative cursor-pointer select-none"
                onClick={handleFlip}
                style={{ perspective: "1000px" }}
              >
                <div
                  className="relative w-full transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    minHeight: "280px",
                  }}
                >
                  {/* Front */}
                  <Card
                    className="absolute inset-0 flex items-center justify-center p-8 text-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div>
                      <Badge variant="outline" className="mb-4 text-xs">Question</Badge>
                      <p className="text-xl font-medium leading-relaxed">{current?.front}</p>
                      <p className="text-xs text-muted-foreground mt-6">Tap to reveal answer</p>
                    </div>
                  </Card>
                  {/* Back */}
                  <Card
                    className="absolute inset-0 flex items-center justify-center p-8 text-center bg-primary/5 border-primary/20"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div>
                      <Badge variant="default" className="mb-4 text-xs">Answer</Badge>
                      <p className="text-xl font-medium leading-relaxed">{current?.back}</p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Rating buttons — only show after flip */}
              {flipped && (
                <div className="mt-6">
                  <p className="text-center text-sm text-muted-foreground mb-3">How well did you know this?</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleRate(0)}
                      disabled={recordReview.isPending}
                    >
                      Again
                    </Button>
                    <Button
                      variant="outline"
                      className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                      onClick={() => handleRate(3)}
                      disabled={recordReview.isPending}
                    >
                      Hard
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                      onClick={() => handleRate(5)}
                      disabled={recordReview.isPending}
                    >
                      Easy
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function SessionComplete({
  total,
  onRestart,
  onBack,
}: {
  total: number;
  onRestart: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="text-center py-16">
      <CardContent className="flex flex-col items-center gap-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-bold">Session Complete!</h2>
        <p className="text-muted-foreground">
          You reviewed all {total} cards. Keep up the great work!
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Decks
          </Button>
          <Button onClick={onRestart}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Study Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
