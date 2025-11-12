import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentNotes } from "@/components/dashboard/RecentNotes";

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
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-xl text-white font-medium animate-pulse">Loading your workspace...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 px-4 py-8 lg:px-16 lg:py-12">
        <WelcomeBanner user={user} />
        <StatsCards />
        
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentNotes />
          
          {/* Due for Review Placeholder */}
          <div className="glass rounded-xl p-8">
            <h3 className="text-xl font-bold mb-4">Due for Review</h3>
            <p className="text-muted-foreground">Your flashcards will appear here when they're ready for review.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
