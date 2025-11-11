import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  question: string;
  options: string[];
  answer_index: number;
  explanation_short?: string;
}

const QuizPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { data: quiz } = useQuery({
    queryKey: ["quiz", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const submitAttempt = useMutation({
    mutationFn: async (score: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: id,
        score,
        total_questions: questions.length,
        answers: selectedAnswers,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Quiz completed!",
        description: "Your results have been saved.",
      });
    },
  });

  if (!quiz) return null;

  const questions: Question[] = Array.isArray(quiz.questions) 
    ? (quiz.questions as unknown as Question[]) 
    : [];

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const score = selectedAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === questions[idx]?.answer_index ? 1 : 0);
    }, 0);

    submitAttempt.mutate(score);
    setShowResults(true);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((acc, answer, idx) => {
      return acc + (answer === questions[idx]?.answer_index ? 1 : 0);
    }, 0);
  };

  if (questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">No questions available for this quiz.</p>
          <Button onClick={() => navigate("/quizzes")} className="mt-4">
            Back to Quizzes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="pt-6 text-center space-y-4">
              <h2 className="text-3xl font-bold">Quiz Complete! 🎉</h2>
              <div className="text-6xl font-bold text-primary">{percentage}%</div>
              <p className="text-xl">
                You scored {score} out of {questions.length}
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={() => navigate("/quizzes")} variant="outline">
                  Back to Quizzes
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Retry Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review Answers</h3>
            {questions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx];
              const isCorrect = userAnswer === q.answer_index;

              return (
                <Card key={idx} className={isCorrect ? "border-success" : "border-destructive"}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">{q.question}</p>
                        <p className="text-sm text-muted-foreground">
                          Your answer: {q.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-success">
                            Correct answer: {q.options[q.answer_index]}
                          </p>
                        )}
                        {q.explanation_short && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {q.explanation_short}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/quizzes")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <h2 className="text-xl font-semibold">{question.question}</h2>

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswers[currentQuestion] === idx
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestion] === idx
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {selectedAnswers[currentQuestion] === idx && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="w-full"
            >
              {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default QuizPlay;
