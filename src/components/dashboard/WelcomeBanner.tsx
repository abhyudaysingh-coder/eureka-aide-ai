import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Plus, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WelcomeBannerProps {
  user: User;
}

export const WelcomeBanner = ({ user }: WelcomeBannerProps) => {
  const navigate = useNavigate();
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-hero p-12 text-white shadow-intense particles">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="relative z-10">
        <h1 className="text-5xl font-bold mb-3 animate-fade-in-up">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-lg text-white/90 mb-8 max-w-2xl">
          Ready to supercharge your learning? Create a new note or review your flashcards to keep your knowledge fresh.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            onClick={() => navigate("/notes")}
            className="glass-intense border-frosted text-white hover:bg-white/30 h-12 px-6"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Note
          </Button>
          <Button
            size="lg"
            onClick={() => navigate("/flashcards")}
            className="glass-intense border-frosted text-white hover:bg-white/30 h-12 px-6"
          >
            <Brain className="mr-2 h-5 w-5" />
            Review Flashcards
          </Button>
        </div>
      </div>
    </div>
  );
};
