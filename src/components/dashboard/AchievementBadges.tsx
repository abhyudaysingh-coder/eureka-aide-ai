import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Award, BookOpen, Brain, Flame, Star, Target, Trophy, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress?: number;
  target?: number;
  gradient: string;
}

export const AchievementBadges = () => {
  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const [stats, profile] = await Promise.all([
        Promise.all([
          supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("quiz_attempts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("flashcards").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        ]),
        supabase.from("profiles").select("streak_days").eq("user_id", user.id).single(),
      ]);

      const [notesCount, quizzesCount, attemptsCount, flashcardsCount] = stats.map(s => s.count || 0);
      const streakDays = profile.data?.streak_days || 0;

      const allAchievements: Achievement[] = [
        {
          id: "first-note",
          name: "First Steps",
          description: "Create your first note",
          icon: BookOpen,
          unlocked: notesCount >= 1,
          progress: notesCount,
          target: 1,
          gradient: "from-blue-500 to-cyan-500",
        },
        {
          id: "note-master",
          name: "Note Master",
          description: "Create 10 notes",
          icon: Brain,
          unlocked: notesCount >= 10,
          progress: notesCount,
          target: 10,
          gradient: "from-purple-500 to-pink-500",
        },
        {
          id: "quiz-starter",
          name: "Quiz Starter",
          description: "Take your first quiz",
          icon: Target,
          unlocked: attemptsCount >= 1,
          progress: attemptsCount,
          target: 1,
          gradient: "from-green-500 to-emerald-500",
        },
        {
          id: "quiz-expert",
          name: "Quiz Expert",
          description: "Complete 20 quizzes",
          icon: Trophy,
          unlocked: attemptsCount >= 20,
          progress: attemptsCount,
          target: 20,
          gradient: "from-yellow-500 to-orange-500",
        },
        {
          id: "week-streak",
          name: "Week Warrior",
          description: "Maintain a 7-day streak",
          icon: Flame,
          unlocked: streakDays >= 7,
          progress: streakDays,
          target: 7,
          gradient: "from-orange-500 to-red-500",
        },
        {
          id: "flashcard-fan",
          name: "Flashcard Fan",
          description: "Create 50 flashcards",
          icon: Zap,
          unlocked: flashcardsCount >= 50,
          progress: flashcardsCount,
          target: 50,
          gradient: "from-indigo-500 to-purple-500",
        },
        {
          id: "dedicated",
          name: "Dedicated",
          description: "Maintain a 30-day streak",
          icon: Star,
          unlocked: streakDays >= 30,
          progress: streakDays,
          target: 30,
          gradient: "from-pink-500 to-rose-500",
        },
        {
          id: "overachiever",
          name: "Overachiever",
          description: "Create 50 notes",
          icon: Award,
          unlocked: notesCount >= 50,
          progress: notesCount,
          target: 50,
          gradient: "from-cyan-500 to-blue-500",
        },
      ];

      return allAchievements;
    },
  });

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gradient">Achievements</h3>
      <p className="text-sm text-muted-foreground mb-4">Unlock badges as you learn</p>
      <TooltipProvider>
        <div className="grid grid-cols-4 gap-4">
          {achievements?.map((achievement) => (
            <Tooltip key={achievement.id}>
              <TooltipTrigger asChild>
                <div
                  className={`relative aspect-square rounded-xl flex items-center justify-center transition-all ${
                    achievement.unlocked
                      ? `bg-gradient-to-br ${achievement.gradient} shadow-glow hover:scale-110 cursor-pointer animate-pulse-glow`
                      : "bg-muted/20 opacity-40 grayscale hover:grayscale-0 hover:opacity-60"
                  }`}
                >
                  <achievement.icon className={`h-8 w-8 ${achievement.unlocked ? "text-white" : "text-muted-foreground"}`} />
                  {achievement.unlocked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-glow">
                      <Trophy className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                {!achievement.unlocked && achievement.progress !== undefined && (
                  <p className="text-xs mt-1">
                    Progress: {achievement.progress}/{achievement.target}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </GlassCard>
  );
};
