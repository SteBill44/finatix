import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Layers, PlayCircle, Clock } from "lucide-react";
import { useFlashcardDecks, useSystemFlashcardDecks, useCreateFlashcardDeck } from "@/hooks/useFlashcards";
import { toast } from "sonner";

export default function Flashcards() {
  const navigate = useNavigate();
  const { data: myDecks = [], isLoading: myLoading } = useFlashcardDecks();
  const { data: systemDecks = [], isLoading: systemLoading } = useSystemFlashcardDecks();
  const createDeck = useCreateFlashcardDeck();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const deck = await createDeck.mutateAsync({ title: title.trim(), description: description.trim() || undefined });
      toast.success("Deck created");
      setOpen(false);
      setTitle("");
      setDescription("");
      navigate(`/flashcards/${deck.id}`);
    } catch {
      toast.error("Failed to create deck");
    }
  };

  return (
    <Layout>
      <SEOHead title="Flashcards" description="Study with spaced-repetition flashcard decks" noIndex />
      <div className="pt-24 lg:pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 uppercase">
                <Layers className="w-6 h-6 text-primary" />
                <span className="text-gradient-brand">Flashcards</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Spaced repetition study system — review cards at the optimal time
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Deck
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Flashcard Deck</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="deck-title">Title</Label>
                    <Input
                      id="deck-title"
                      placeholder="e.g. Management Accounting Fundamentals"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="deck-desc">Description (optional)</Label>
                    <Textarea
                      id="deck-desc"
                      placeholder="What's this deck about?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreate}
                    disabled={!title.trim() || createDeck.isPending}
                  >
                    Create Deck
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="my-decks">
            <TabsList className="mb-6">
              <TabsTrigger value="my-decks">My Decks</TabsTrigger>
              <TabsTrigger value="course-decks">Course Decks</TabsTrigger>
            </TabsList>

            <TabsContent value="my-decks">
              {myLoading ? (
                <DeckGrid count={3} loading />
              ) : myDecks.length === 0 ? (
                <EmptyState onNew={() => setOpen(true)} />
              ) : (
                <DeckGrid decks={myDecks} onStudy={(id) => navigate(`/flashcards/${id}`)} />
              )}
            </TabsContent>

            <TabsContent value="course-decks">
              {systemLoading ? (
                <DeckGrid count={3} loading />
              ) : systemDecks.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  No course decks available yet
                </div>
              ) : (
                <DeckGrid decks={systemDecks} onStudy={(id) => navigate(`/flashcards/${id}`)} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

function DeckGrid({
  decks = [],
  onStudy,
  loading = false,
  count = 0,
}: {
  decks?: ReturnType<typeof useFlashcardDecks>["data"];
  onStudy?: (id: string) => void;
  loading?: boolean;
  count?: number;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(decks || []).map((deck) => (
        <Card key={deck.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base leading-tight">{deck.title}</CardTitle>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {deck.card_count ?? 0} cards
              </Badge>
            </div>
            {deck.description && (
              <CardDescription className="line-clamp-2 text-xs">{deck.description}</CardDescription>
            )}
            {deck.course && (
              <Badge variant="outline" className="text-xs w-fit">
                <BookOpen className="w-3 h-3 mr-1" />
                {deck.course.title}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="sm"
              onClick={() => onStudy?.(deck.id)}
              disabled={(deck.card_count ?? 0) === 0}
            >
              <PlayCircle className="w-4 h-4 mr-1.5" />
              {(deck.card_count ?? 0) === 0 ? "Add Cards First" : "Study Now"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Layers className="w-14 h-14 text-muted-foreground/30" />
      <p className="font-medium text-muted-foreground">No decks yet</p>
      <p className="text-sm text-muted-foreground/70 text-center max-w-xs">
        Create your first flashcard deck to start studying with spaced repetition
      </p>
      <Button onClick={onNew}>
        <Plus className="w-4 h-4 mr-1.5" />
        Create First Deck
      </Button>
    </div>
  );
}
