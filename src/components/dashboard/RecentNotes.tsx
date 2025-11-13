import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Sparkles, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export const RecentNotes = () => {
  const navigate = useNavigate();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["recentNotes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <GlassCard>
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <div>
            <GlassCardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recent Notes
            </GlassCardTitle>
            <GlassCardDescription>Your latest study materials</GlassCardDescription>
          </div>
          <Button onClick={() => navigate("/notes")} variant="gradient" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>
      </GlassCardHeader>
      <GlassCardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group relative flex items-start gap-4 p-4 rounded-xl border-l-4 border-primary bg-card/50 hover:bg-card cursor-pointer transition-all hover-lift"
                onClick={() => navigate(`/notes/${note.id}`)}
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate mb-1">{note.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {note.content.substring(0, 150)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-4 w-4 text-primary animate-glow" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-full gradient-accent mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <p className="text-muted-foreground mb-4">No notes yet. Create your first note to get started!</p>
            <Button onClick={() => navigate("/notes")} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
};
