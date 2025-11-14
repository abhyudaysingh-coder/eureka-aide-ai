import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ActivityHeatmap = () => {
  const { data: activityData } = useQuery({
    queryKey: ["activityHeatmap"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [notes, attempts] = await Promise.all([
        supabase.from("notes").select("created_at").eq("user_id", user.id).gte("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("quiz_attempts").select("completed_at").eq("user_id", user.id).gte("completed_at", thirtyDaysAgo.toISOString()),
      ]);

      const activityMap = new Map<string, number>();
      
      notes.data?.forEach(note => {
        const date = new Date(note.created_at).toISOString().split('T')[0];
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      });

      attempts.data?.forEach(attempt => {
        const date = new Date(attempt.completed_at!).toISOString().split('T')[0];
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      });

      const result = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          count: activityMap.get(dateStr) || 0,
        });
      }
      
      return result;
    },
  });

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/20";
    if (count <= 2) return "bg-primary/20";
    if (count <= 4) return "bg-primary/40";
    if (count <= 6) return "bg-primary/60";
    return "bg-primary/80";
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gradient">Activity Heatmap</h3>
      <p className="text-sm text-muted-foreground mb-4">Last 30 days of study activity</p>
      <TooltipProvider>
        <div className="grid grid-cols-10 gap-2">
          {activityData?.map((day) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <div
                  className={`aspect-square rounded-md transition-all hover:scale-110 hover:shadow-glow cursor-pointer ${getIntensityClass(day.count)}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{new Date(day.date).toLocaleDateString()}</p>
                <p className="text-xs font-semibold">{day.count} activities</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </GlassCard>
  );
};
