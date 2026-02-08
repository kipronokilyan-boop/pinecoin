import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, DollarSign, Pencil, ShieldAlert } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface Survey {
  id: string;
  title: string;
  questions: number;
  payout: number;
  category: string;
}

interface Question {
  id: string;
  question_text: string;
  question_order: number;
  options: Json;
}

type SurveyStage = "intro" | "questions" | "complete";

const TakeSurvey = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stage, setStage] = useState<SurveyStage>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id || !user) return;
    const fetchAll = async () => {
      const [sRes, qRes, profileRes, completionsRes] = await Promise.all([
        supabase.from("surveys").select("*").eq("id", id).maybeSingle(),
        supabase.from("survey_questions").select("*").eq("survey_id", id).order("question_order"),
        supabase.from("profiles").select("daily_survey_limit, account_tier").eq("user_id", user.id).maybeSingle(),
        supabase.from("survey_completions").select("id, completed_at").eq("user_id", user.id),
      ]);
      if (sRes.data) setSurvey(sRes.data);
      if (qRes.data) setQuestions(qRes.data);

      // Check daily limit
      const limit = (profileRes.data as any)?.daily_survey_limit ?? 1;
      setDailyLimit(limit);
      const today = new Date().toISOString().split("T")[0];
      const todayCount = (completionsRes.data ?? []).filter(
        (c: any) => c.completed_at && c.completed_at.startsWith(today)
      ).length;
      if (todayCount >= limit) {
        setLimitReached(true);
      }
    };
    fetchAll();
  }, [id, user]);

  // Timer for each question
  useEffect(() => {
    if (stage !== "questions") return;
    setTimeLeft(5);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, currentQ]);

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user || !survey) return;
    setSubmitting(true);

    // Record completion
    await supabase.from("survey_completions").insert({
      user_id: user.id,
      survey_id: survey.id,
    });

    // Update balance
    await supabase.from("profiles").update({
      balance: (await supabase.from("profiles").select("balance").eq("user_id", user.id).maybeSingle()).data?.balance + survey.payout,
    }).eq("user_id", user.id);

    setStage("complete");
    setSubmitting(false);
  };

  if (!survey) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading survey...</div>;
  }

  const currentQuestion = questions[currentQ];
  const options: string[] = currentQuestion
    ? (Array.isArray(currentQuestion.options) ? currentQuestion.options as string[] : ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"])
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="gradient-orange px-4 py-3 flex items-center gap-4">
        <BarChart3 className="h-6 w-6 text-primary-foreground" />
        <span className="font-bold text-primary-foreground">PINECOIN</span>
        <button onClick={() => navigate("/dashboard")} className="ml-auto text-primary-foreground/80 text-sm hover:text-primary-foreground">
          ← Back to Dashboard
        </button>
      </nav>

      {limitReached && (
        <div className="p-4 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-8 text-center max-w-md w-full">
            <div className="gradient-orange-pink rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Daily Limit Reached</h2>
            <p className="text-[hsl(192,40%,12%)]/70 mb-2">
              Your <strong>Free Account</strong> allows only <strong>{dailyLimit} survey{dailyLimit > 1 ? "s" : ""} per day</strong>.
            </p>
            <p className="text-[hsl(192,40%,12%)]/70 mb-6">
              Upgrade your account to unlock more surveys and earn more!
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/packages")}
                className="w-full h-12 rounded-full gradient-orange-pink text-primary-foreground text-base font-semibold border-0 hover:opacity-90"
              >
                Upgrade Account
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="w-full h-12 rounded-full border-primary/30 text-[hsl(192,40%,12%)]"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {!limitReached && stage === "intro" && (
        <div className="p-4 space-y-6">
          {/* Top info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Amount you will earn</p>
              <span className="text-secondary text-sm font-semibold border border-secondary rounded-full px-3 py-1">Ksh {survey.payout}</span>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Survey Topic</p>
              <span className="text-secondary text-sm font-semibold border border-secondary rounded-full px-3 py-1">{survey.title}</span>
            </div>
          </div>

          {/* Intro card */}
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-6">
            <p className="text-center text-background mb-4">
              You are about to take Pinecoin survey. You were prequalified for this survey and will earn{" "}
              <span className="inline-flex items-center gap-1 gradient-orange text-primary-foreground text-sm px-3 py-1 rounded-full font-semibold">
                <DollarSign className="h-3 w-3" /> Ksh {survey.payout}
              </span>
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-background/80">
                <Pencil className="h-5 w-5 text-primary" />
                <span>Give authentic & honest feedback</span>
              </div>
              <div className="flex items-center gap-3 text-background/80">
                <Pencil className="h-5 w-5 text-primary" />
                <span>Earn money and have fun</span>
              </div>
            </div>

            <Button
              onClick={() => setStage("questions")}
              className="w-full h-14 rounded-full gradient-orange-pink text-primary-foreground text-lg font-semibold border-0 hover:opacity-90"
            >
              Start Survey
            </Button>
          </div>

          <p className="text-muted-foreground text-sm text-center">
            Start survey and make sure to complete and submit in order to earn
          </p>
        </div>
      )}

      {!limitReached && stage === "questions" && currentQuestion && (
        <div className="p-4 space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span className="text-primary font-semibold">{timeLeft}s</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="gradient-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-background mb-6">{currentQuestion.question_text}</h3>

            <div className="space-y-3">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedAnswer(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    selectedAnswer === opt
                      ? "border-primary bg-primary/10 text-background font-semibold"
                      : "border-border/20 bg-foreground/5 text-background/80 hover:border-primary/30"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="w-full h-12 mt-6 rounded-full gradient-orange-pink text-primary-foreground text-base font-semibold border-0 hover:opacity-90 disabled:opacity-50"
            >
              {currentQ < questions.length - 1 ? "Next" : "Submit Survey"}
            </Button>
          </div>
        </div>
      )}

      {stage === "complete" && (
        <div className="p-4 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-8 text-center max-w-md w-full">
            <div className="gradient-orange rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <DollarSign className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Survey Completed!</h2>
            <p className="text-background/70 mb-4">
              You've earned <span className="font-bold text-primary">Ksh {survey.payout}</span> for completing this survey.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full h-12 rounded-full gradient-orange text-primary-foreground text-base font-semibold border-0 hover:opacity-90"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeSurvey;
