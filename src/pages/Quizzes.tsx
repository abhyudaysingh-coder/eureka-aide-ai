import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Play, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Quizzes = () => {
  const navigate = useNavigate();

  const { data: quizzes } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("quizzes")
        .select("*, notes(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-accent" />
            My Quizzes
          </h1>
          <p className="text-muted-foreground mt-1">
            Test your knowledge with AI-generated quizzes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes?.map((quiz) => {
            const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
            return (
              <Card
                key={quiz.id}
                className="hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => navigate(`/quizzes/${quiz.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2">{quiz.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{questionCount} questions</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(quiz.created_at), { addSuffix: true })}
                    </span>
                    <Button size="sm" className="gap-2">
                      <Play className="w-3.5 h-3.5" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {(!quizzes || quizzes.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No quizzes yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create a note and generate a quiz from it to start testing your knowledge!
              </p>
              <Button onClick={() => navigate("/notes")} className="gap-2">
                <ArrowRight className="w-5 h-5" />
                Go to Notes
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Quizzes;
