import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentNotes } from "@/components/dashboard/RecentNotes";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Banner with Gradient */}
        <div className="gradient-bg rounded-3xl p-8 shadow-glow relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-white/90 text-lg mb-6">
              Ready to continue your learning journey?
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm"
                onClick={() => navigate("/notes")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
              <Button 
                variant="outline"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm"
                onClick={() => navigate("/flashcards")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Study Now
              </Button>
            </div>
          </div>
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-glow/30 rounded-full blur-3xl" />
        </div>
        
        <DashboardHeader user={user} />
        <StatsCards />
        <RecentNotes />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
