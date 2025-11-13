import { NavLink } from "react-router-dom";
import { Brain, BookOpen, FileText, Sparkles, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/auth");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/notes", icon: BookOpen, label: "Notes" },
    { to: "/quizzes", icon: FileText, label: "Quizzes" },
    { to: "/flashcards", icon: Sparkles, label: "Flashcards" },
  ];

  return (
    <aside className="w-64 glass-strong border-r border-white/10 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-glow animate-pulse-glow">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gradient">Study Buddy</h2>
            <p className="text-xs text-muted-foreground">Learn smarter</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "gradient-bg text-white shadow-glow font-medium"
                  : "text-muted-foreground hover:glass-card hover:text-foreground hover-glow"
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 hover-lift"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
