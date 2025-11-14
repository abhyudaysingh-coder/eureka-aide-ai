import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Flame, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const StreakTracker = () => {
  const { data: streakData } = useQuery({
    queryKey: ["streakData"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("streak_days, points")
        .eq("user_id", user.id)
        .single();

      const today = new Date().toISOString().split('T')[0];
      const { count: todayActivities } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      return {
        streak: profile?.streak_days || 0,
        points: profile?.points || 0,
        todayGoal: todayActivities || 0,
        goalTarget: 3,
      };
    },
  });

  const goalProgress = streakData ? Math.min((streakData.todayGoal / streakData.goalTarget) * 100, 100) : 0;

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent opacity-50" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gradient">Study Streak</h3>
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-glow animate-pulse-glow">
            <Flame className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="text-center p-4 rounded-xl bg-muted/20 backdrop-blur-sm">
            <div className="text-5xl font-bold text-gradient mb-2">{streakData?.streak || 0}</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span>Today's Goal</span>
              </div>
              <span className="font-semibold">{streakData?.todayGoal || 0}/{streakData?.goalTarget || 3}</span>
            </div>
            <Progress value={goalProgress} className="h-2" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm">Total Points</span>
            </div>
            <span className="text-lg font-bold text-gradient">{streakData?.points || 0}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
