import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useFlashcardDeck,
  useAddCard,
  useUpdateCard,
  useDeleteCard,
} from "@/hooks/useFlashcards";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const FlashcardEdit = () => {
  const { deckId } = useParams();
  const { data, isLoading } = useFlashcardDeck(deckId);
  const addCard = useAddCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();

  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  const handleAddCard = async () => {
    if (!newFront.trim() || !newBack.trim()) {
      toast.error("Please fill in both sides of the card");
      return;
    }

    try {
      await addCard.mutateAsync({
        deck_id: deckId!,
        front: newFront.trim(),
        back: newBack.trim(),
      });
      setNewFront("");
      setNewBack("");
      toast.success("Card added!");
    } catch {
      toast.error("Failed to add card");
    }
  };

  const handleStartEdit = (card: { id: string; front: string; back: string }) => {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editFront.trim() || !editBack.trim()) return;

    try {
      await updateCard.mutateAsync({
        id: editingId,
        front: editFront.trim(),
        back: editBack.trim(),
      });
      setEditingId(null);
      toast.success("Card updated!");
    } catch {
      toast.error("Failed to update card");
    }
  };

  const handleDelete = async (cardId: string) => {
    try {
      await deleteCard.mutateAsync(cardId);
      toast.success("Card deleted");
    } catch {
      toast.error("Failed to delete card");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-3xl py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-40 mb-4" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24 mt-4" />
        </div>
      </Layout>
    );
  }

  if (!data?.deck) {
    return (
      <Layout>
        <div className="container max-w-3xl py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Deck not found</h1>
          <Button asChild>
            <Link to="/flashcards">Back to Flashcards</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" asChild className="mb-2 -ml-4">
              <Link to="/flashcards">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{data.deck.title}</h1>
            <p className="text-muted-foreground">
              {data.cards.length} cards
            </p>
          </div>
          <Button asChild>
            <Link to={`/flashcards/${deckId}/study`}>Study Now</Link>
          </Button>
        </div>

        {/* Add New Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Card
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="front">Front (Question)</Label>
                <Textarea
                  id="front"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Enter the question or term..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="back">Back (Answer)</Label>
                <Textarea
                  id="back"
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Enter the answer or definition..."
                  rows={3}
                />
              </div>
            </div>
            <Button 
              onClick={handleAddCard} 
              disabled={addCard.isPending}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </CardContent>
        </Card>

        {/* Cards List */}
        <div className="space-y-3">
          <h3 className="font-semibold mb-4">Cards in this deck</h3>
          
          {data.cards.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No cards yet. Add your first card above!
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {data.cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="py-4">
                      {editingId === card.id ? (
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Front</Label>
                              <Textarea
                                value={editFront}
                                onChange={(e) => setEditFront(e.target.value)}
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Back</Label>
                              <Textarea
                                value={editBack}
                                onChange={(e) => setEditBack(e.target.value)}
                                rows={2}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={handleSaveEdit}
                              disabled={updateCard.isPending}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground/50 mt-1 flex-shrink-0" />
                          <div className="flex-1 grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Front</p>
                              <p className="text-sm">{card.front}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Back</p>
                              <p className="text-sm">{card.back}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(card)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(card.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FlashcardEdit;
