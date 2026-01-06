import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFlashcardDeck, useRateCard, type Flashcard } from "@/hooks/useFlashcards";
import { isDue, formatInterval } from "@/lib/sm2";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const FlashcardStudy = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useFlashcardDeck(deckId);
  const rateCard = useRateCard();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCount, setStudiedCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Filter to due cards only
  const dueCards = useMemo(() => {
    if (!data?.cards) return [];
    return data.cards.filter(card => {
      if (!card.progress) return true; // New card
      return isDue(card.progress.next_review);
    });
  }, [data?.cards]);

  const currentCard = dueCards[currentIndex];
  const progress = dueCards.length > 0 ? (studiedCount / dueCards.length) * 100 : 0;

  useEffect(() => {
    // Reset flip when changing cards
    setIsFlipped(false);
  }, [currentIndex]);

  const handleRate = async (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;

    try {
      await rateCard.mutateAsync({
        cardId: currentCard.id,
        rating,
        currentProgress: currentCard.progress || null,
      });

      setStudiedCount(prev => prev + 1);

      // Move to next card or complete session
      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setSessionComplete(true);
        toast.success("Study session complete!");
      }
    } catch {
      toast.error("Failed to save progress");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      setIsFlipped(!isFlipped);
    } else if (isFlipped) {
      if (e.key === "1") handleRate(1);
      else if (e.key === "2") handleRate(2);
      else if (e.key === "3") handleRate(3);
      else if (e.key === "4") handleRate(4);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-2xl py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (!data?.deck) {
    return (
      <Layout>
        <div className="container max-w-2xl py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Deck not found</h1>
          <Button asChild>
            <Link to="/flashcards">Back to Flashcards</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (dueCards.length === 0 || sessionComplete) {
    return (
      <Layout>
        <div className="container max-w-2xl py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/flashcards">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Flashcards
            </Link>
          </Button>

          <Card className="text-center py-12 px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">
              {sessionComplete ? "Session Complete!" : "All caught up!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {sessionComplete
                ? `You studied ${studiedCount} cards. Great work!`
                : "No cards are due for review right now. Check back later!"}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link to="/flashcards">Back to Decks</Link>
              </Button>
              <Button asChild>
                <Link to={`/flashcards/${deckId}/edit`}>Add More Cards</Link>
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div 
        className="container max-w-2xl py-8"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link to="/flashcards">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {dueCards.length}
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2 mb-8" />

        {/* Flashcard */}
        <div 
          className="perspective-1000 cursor-pointer mb-8"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentCard.id}-${isFlipped ? "back" : "front"}`}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="min-h-[300px] flex items-center justify-center p-8 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
                    {isFlipped ? "Answer" : "Question"}
                  </p>
                  <p className="text-xl font-medium">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                  {!isFlipped && (
                    <p className="text-sm text-muted-foreground mt-6">
                      Click or press Space to reveal
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Rating Buttons */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              <p className="text-center text-sm text-muted-foreground mb-4">
                How well did you know this?
              </p>
              <div className="grid grid-cols-4 gap-3">
                <RatingButton
                  rating={1}
                  label="Again"
                  sublabel="<1 min"
                  color="destructive"
                  onClick={() => handleRate(1)}
                  disabled={rateCard.isPending}
                />
                <RatingButton
                  rating={2}
                  label="Hard"
                  sublabel={formatInterval(1)}
                  color="warning"
                  onClick={() => handleRate(2)}
                  disabled={rateCard.isPending}
                />
                <RatingButton
                  rating={3}
                  label="Good"
                  sublabel={formatInterval(currentCard.progress?.interval_days ? currentCard.progress.interval_days * 1.5 : 6)}
                  color="default"
                  onClick={() => handleRate(3)}
                  disabled={rateCard.isPending}
                />
                <RatingButton
                  rating={4}
                  label="Easy"
                  sublabel={formatInterval(currentCard.progress?.interval_days ? currentCard.progress.interval_days * 2.5 : 14)}
                  color="success"
                  onClick={() => handleRate(4)}
                  disabled={rateCard.isPending}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard shortcuts hint */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Keyboard: Space to flip, 1-4 to rate
        </p>
      </div>
    </Layout>
  );
};

interface RatingButtonProps {
  rating: 1 | 2 | 3 | 4;
  label: string;
  sublabel: string;
  color: "destructive" | "warning" | "default" | "success";
  onClick: () => void;
  disabled?: boolean;
}

const RatingButton = ({ rating, label, sublabel, color, onClick, disabled }: RatingButtonProps) => {
  const colorClasses = {
    destructive: "border-destructive/50 hover:bg-destructive/10 hover:border-destructive",
    warning: "border-yellow-500/50 hover:bg-yellow-500/10 hover:border-yellow-500",
    default: "border-primary/50 hover:bg-primary/10 hover:border-primary",
    success: "border-green-500/50 hover:bg-green-500/10 hover:border-green-500",
  };

  return (
    <Button
      variant="outline"
      className={`h-auto py-3 flex flex-col ${colorClasses[color]}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-xs text-muted-foreground mb-0.5">{rating}</span>
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{sublabel}</span>
    </Button>
  );
};

export default FlashcardStudy;
