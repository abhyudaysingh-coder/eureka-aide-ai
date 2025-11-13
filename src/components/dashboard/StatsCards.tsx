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
      gradient: "from-primary to-primary-glow",
    },
    {
      title: "Quizzes Created",
      value: stats?.quizzes || 0,
      icon: FileText,
      gradient: "from-accent to-purple-500",
    },
    {
      title: "Flashcards",
      value: stats?.flashcards || 0,
      icon: Sparkles,
      gradient: "from-success to-emerald-400",
    },
    {
      title: "Quiz Attempts",
      value: stats?.attempts || 0,
      icon: TrendingUp,
      gradient: "from-primary to-accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className={`bg-gradient-to-br ${card.gradient} shadow-glow hover:shadow-glow-strong hover-lift border-0 relative overflow-hidden`}
        >
          {/* Icon in top-left with glow */}
          <div className="absolute top-4 left-4 p-3 rounded-full bg-white/20 backdrop-blur-sm">
            <card.icon className="w-5 h-5 text-white" />
          </div>
          
          <CardContent className="pt-20 pb-6">
            <div className="text-5xl font-bold text-white mb-1">
              {card.value}
            </div>
            <p className="text-white/80 text-sm font-medium">
              {card.title}
            </p>
          </CardContent>
          
          {/* Decorative glow */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </Card>
      ))}
    </div>
  );
};
