import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
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
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      title: "Quizzes Created",
      value: stats?.quizzes || 0,
      icon: FileText,
      gradient: "from-purple-500 to-pink-400",
    },
    {
      title: "Flashcards",
      value: stats?.flashcards || 0,
      icon: Sparkles,
      gradient: "from-green-500 to-emerald-400",
    },
    {
      title: "Quiz Attempts",
      value: stats?.attempts || 0,
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-400",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <GlassCard key={card.title} className="relative overflow-hidden group">
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight">{card.value}</div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
