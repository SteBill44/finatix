import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, BookOpen, Layers, Clock, Trash2, MoreVertical } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlashcardDecks, useDueCardsCount, useCreateDeck, useDeleteDeck } from "@/hooks/useFlashcards";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Flashcards = () => {
  const { user } = useAuth();
  const { data: decks, isLoading } = useFlashcardDecks();
  const { data: dueCount } = useDueCardsCount();
  const createDeck = useCreateDeck();
  const deleteDeck = useDeleteDeck();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Get enrolled courses for dropdown
  const { data: enrollments } = useQuery({
    queryKey: ["enrollments-for-flashcards", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("course_id, courses(id, title)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) {
      toast.error("Please enter a deck title");
      return;
    }

    try {
      await createDeck.mutateAsync({
        title: newDeckTitle.trim(),
        description: newDeckDescription.trim() || undefined,
        course_id: selectedCourseId || undefined,
      });
      
      setIsCreateOpen(false);
      setNewDeckTitle("");
      setNewDeckDescription("");
      setSelectedCourseId("");
      toast.success("Deck created successfully!");
    } catch {
      toast.error("Failed to create deck");
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteDeck.mutateAsync(deckId);
      toast.success("Deck deleted");
    } catch {
      toast.error("Failed to delete deck");
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
            <p className="text-muted-foreground">
              Master concepts with spaced repetition
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {dueCount !== undefined && dueCount > 0 && (
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg">
                <span className="font-semibold">{dueCount}</span> cards due
              </div>
            )}
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Deck
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Flashcard Deck</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Deck Title</Label>
                    <Input
                      id="title"
                      value={newDeckTitle}
                      onChange={(e) => setNewDeckTitle(e.target.value)}
                      placeholder="e.g., Financial Ratios"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={newDeckDescription}
                      onChange={(e) => setNewDeckDescription(e.target.value)}
                      placeholder="What this deck covers..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Link to Course (optional)</Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No course</SelectItem>
                        {enrollments?.map((e) => (
                          <SelectItem key={e.course_id} value={e.course_id}>
                            {(e.courses as { title: string })?.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateDeck}
                    disabled={createDeck.isPending}
                  >
                    Create Deck
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Decks Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : decks?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No flashcard decks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first deck to start learning with spaced repetition
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks?.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-md transition-shadow h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {deck.title}
                        </CardTitle>
                        {deck.courses?.title && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {deck.courses.title}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteDeck(deck.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {deck.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {deck.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Layers className="h-4 w-4" />
                        {deck.card_count} cards
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ~{Math.ceil(deck.card_count * 0.5)} min
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link to={`/flashcards/${deck.id}/edit`}>
                          Edit Cards
                        </Link>
                      </Button>
                      <Button asChild className="flex-1">
                        <Link to={`/flashcards/${deck.id}/study`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Study
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Flashcards;
