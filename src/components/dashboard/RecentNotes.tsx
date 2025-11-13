import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, ArrowRight } from "lucide-react";
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
    <Card className="border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="w-6 h-6" />
          Recent Notes
        </CardTitle>
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate("/notes")}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="glass-card rounded-2xl p-5 hover-lift hover-glow cursor-pointer group relative overflow-hidden border-l-4 border-primary"
                onClick={() => navigate(`/notes/${note.id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* File Icon with glow */}
                  <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {note.content.substring(0, 80)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                
                {/* Decorative glow */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-2xl">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-6 text-lg">No notes yet</p>
            <Button onClick={() => navigate("/notes")} className="gap-2" size="lg">
              <Plus className="w-5 h-5" />
              Create Your First Note
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
