import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Flashcards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { toast } = useToast();

  const { data: flashcards, refetch } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateFlashcard = useMutation({
    mutationFn: async ({ id, difficulty }: { id: string; difficulty: "easy" | "medium" | "hard" }) => {
      const card = flashcards?.find((f) => f.id === id);
      if (!card) return;

      let newInterval = card.interval_days;
      let newEaseFactor = card.ease_factor;
      let newRepetitions = card.repetitions;

      if (difficulty === "easy") {
        newInterval = Math.round(card.interval_days * card.ease_factor * 1.3);
        newEaseFactor = Math.min(card.ease_factor + 0.15, 2.5);
        newRepetitions = card.repetitions + 1;
      } else if (difficulty === "medium") {
        newInterval = Math.round(card.interval_days * card.ease_factor);
        newRepetitions = card.repetitions + 1;
      } else {
        newInterval = 1;
        newEaseFactor = Math.max(card.ease_factor - 0.2, 1.3);
        newRepetitions = 0;
      }

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + newInterval);

      const { error } = await supabase
        .from("flashcards")
        .update({
          interval_days: newInterval,
          ease_factor: newEaseFactor,
          repetitions: newRepetitions,
          next_review: nextReview.toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      handleNext();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (flashcards && currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleDifficulty = (difficulty: "easy" | "medium" | "hard") => {
    if (flashcards && flashcards[currentIndex]) {
      updateFlashcard.mutate({ id: flashcards[currentIndex].id, difficulty });
    }
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No flashcards yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Create a note and generate flashcards from it to start studying!
          </p>
          <Button onClick={() => window.location.href = "/notes"} className="gap-2">
            Go to Notes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-success" />
              Flashcards
            </h1>
            <p className="text-muted-foreground mt-1">
              Study with spaced repetition
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </div>
        </div>

        <div className="relative">
          <Card
            className="cursor-pointer h-96 flex items-center justify-center perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <CardContent className="pt-6 w-full h-full flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
                  <RotateCw className="w-4 h-4" />
                  <span>Click to flip</span>
                </div>

                <div className="text-2xl font-medium px-8">
                  {isFlipped ? currentCard.back : currentCard.front}
                </div>

                <div className="text-sm text-muted-foreground mt-8">
                  {isFlipped ? "Answer" : "Question"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isFlipped && (
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => handleDifficulty("hard")}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Hard
            </Button>
            <Button
              onClick={() => handleDifficulty("medium")}
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              Medium
            </Button>
            <Button
              onClick={() => handleDifficulty("easy")}
              variant="outline"
              className="border-success text-success hover:bg-success hover:text-success-foreground"
            >
              Easy
            </Button>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Study Progress</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repetitions:</span>
                <span className="font-medium">{currentCard.repetitions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next review:</span>
                <span className="font-medium">
                  {new Date(currentCard.next_review).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interval:</span>
                <span className="font-medium">{currentCard.interval_days} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Flashcards;
