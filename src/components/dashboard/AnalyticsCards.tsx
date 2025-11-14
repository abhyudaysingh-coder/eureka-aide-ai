import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Activity, Award, Clock, TrendingUp } from "lucide-react";

export const AnalyticsCards = () => {
  const { data: analytics } = useQuery({
    queryKey: ["dashboardAnalytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [notes, attempts, allAttempts] = await Promise.all([
        supabase.from("notes").select("created_at").eq("user_id", user.id).gte("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("quiz_attempts").select("score, total_questions, completed_at").eq("user_id", user.id).gte("completed_at", thirtyDaysAgo.toISOString()),
        supabase.from("quiz_attempts").select("score, total_questions").eq("user_id", user.id),
      ]);

      const learningVelocity = notes.data?.length || 0;
      const avgScore = allAttempts.data?.length
        ? Math.round(
            allAttempts.data.reduce((acc, a) => acc + (a.score / a.total_questions) * 100, 0) / allAttempts.data.length
          )
        : 0;
      const retentionRate = avgScore > 70 ? 85 : avgScore > 50 ? 65 : 45;
      const completionRate = attempts.data?.length || 0;

      return {
        learningVelocity,
        retentionRate,
        avgScore,
        completionRate,
      };
    },
  });

  const cards = [
    {
      title: "Learning Velocity",
      value: `${analytics?.learningVelocity || 0}`,
      subtitle: "notes last 30 days",
      icon: TrendingUp,
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    },
    {
      title: "Retention Rate",
      value: `${analytics?.retentionRate || 0}%`,
      subtitle: "knowledge retained",
      icon: Activity,
      gradient: "from-green-500 via-emerald-500 to-teal-500",
    },
    {
      title: "Avg Performance",
      value: `${analytics?.avgScore || 0}%`,
      subtitle: "quiz average",
      icon: Award,
      gradient: "from-purple-500 via-violet-500 to-fuchsia-500",
    },
    {
      title: "Completion Rate",
      value: `${analytics?.completionRate || 0}`,
      subtitle: "quizzes completed",
      icon: Clock,
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <GlassCard key={card.title} className="relative overflow-hidden group hover-lift animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-15 transition-opacity`} />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-glow animate-pulse-glow`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold tracking-tight text-gradient mb-1">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
