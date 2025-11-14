import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const PerformanceChart = () => {
  const { data: performanceData } = useQuery({
    queryKey: ["performanceChart"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("score, total_questions, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: true })
        .limit(10);

      return attempts?.map((attempt, index) => ({
        quiz: `Quiz ${index + 1}`,
        score: Math.round((attempt.score / attempt.total_questions) * 100),
        date: new Date(attempt.completed_at!).toLocaleDateString(),
      })) || [];
    },
  });

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gradient">Performance Trend</h3>
      <p className="text-sm text-muted-foreground mb-4">Your quiz scores over time</p>
      <ChartContainer config={chartConfig} className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis dataKey="quiz" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </GlassCard>
  );
};
