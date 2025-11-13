import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Sparkles, TrendingUp } from "lucide-react";

export const StatsCards = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const [notesCount, quizzesCount, flashcardsCount, attemptsCount] = await Promise.all([
        supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("quiz_attempts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      return {
        notes: notesCount.count || 0,
        quizzes: quizzesCount.count || 0,
        flashcards: flashcardsCount.count || 0,
        attempts: attemptsCount.count || 0,
      };
    },
  });

  const cards = [
    {
      title: "Total Notes",
      value: stats?.notes || 0,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Quizzes Created",
      value: stats?.quizzes || 0,
      icon: FileText,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Flashcards",
      value: stats?.flashcards || 0,
      icon: Sparkles,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Quiz Attempts",
      value: stats?.attempts || 0,
      icon: TrendingUp,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
