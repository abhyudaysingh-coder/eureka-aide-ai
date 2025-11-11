import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles, FileText, Zap, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const { data: note, refetch } = useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const deleteNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
      navigate("/notes");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateSummary = async () => {
    if (!note) return;
    setIsGeneratingSummary(true);

    try {
      const { data, error } = await supabase.functions.invoke("summarize-note", {
        body: { noteId: note.id, content: note.content },
      });

      if (error) throw error;

      toast({
        title: "Summary generated!",
        description: "Your note summary is ready.",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!note) return;
    setIsGeneratingQuiz(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { noteId: note.id, content: note.content, title: note.title },
      });

      if (error) throw error;

      toast({
        title: "Quiz generated!",
        description: "Your quiz is ready to take.",
      });

      navigate(`/quizzes/${data.quizId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!note) return;
    setIsGeneratingFlashcards(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-flashcards", {
        body: { noteId: note.id, content: note.content },
      });

      if (error) throw error;

      toast({
        title: "Flashcards generated!",
        description: `${data.count} flashcards created.`,
      });

      navigate("/flashcards");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  if (!note) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/notes")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notes
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteNote.mutate()}
            disabled={deleteNote.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="gap-2"
            variant="outline"
          >
            {isGeneratingSummary ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {note.summary ? "Regenerate Summary" : "Generate Summary"}
          </Button>

          <Button
            onClick={handleGenerateQuiz}
            disabled={isGeneratingQuiz}
            className="gap-2"
            variant="outline"
          >
            {isGeneratingQuiz ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Generate Quiz
          </Button>

          <Button
            onClick={handleGenerateFlashcards}
            disabled={isGeneratingFlashcards}
            className="gap-2"
            variant="outline"
          >
            {isGeneratingFlashcards ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Generate Flashcards
          </Button>
        </div>

        {note.summary && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">AI Summary</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {note.summary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Note Content</h3>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{note.content}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NoteDetail;
