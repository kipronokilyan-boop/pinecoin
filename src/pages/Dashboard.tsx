import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BarChart3, User, RefreshCw, Clock, HelpCircle, Wallet, Tag, Star } from "lucide-react";

interface Survey {
  id: string;
  title: string;
  questions: number;
  payout: number;
  category: string;
}

interface Profile {
  balance: number;
  loyalty_points: number;
  first_name: string;
  referral_code: string;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [surveyRes, profileRes] = await Promise.all([
        supabase.from("surveys").select("*").eq("is_active", true),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      if (surveyRes.data) setSurveys(surveyRes.data);
      if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
    };

    fetchData();
  }, [user]);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="gradient-orange px-4 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
          <span className="font-bold text-primary-foreground">PINECOIN</span>
        </div>
        <button onClick={() => setActiveTab("home")} className={`text-primary-foreground/80 text-sm font-semibold hover:text-primary-foreground ${activeTab === "home" ? "text-primary-foreground underline underline-offset-4" : ""}`}>HOME</button>
        <button onClick={() => setActiveTab("profile")} className={`text-primary-foreground/80 text-sm font-semibold hover:text-primary-foreground ${activeTab === "profile" ? "text-primary-foreground underline underline-offset-4" : ""}`}>PROFILE</button>
        <button onClick={() => setActiveTab("referrals")} className={`text-primary-foreground/80 text-sm font-semibold hover:text-primary-foreground ${activeTab === "referrals" ? "text-primary-foreground underline underline-offset-4" : ""}`}>REFERRALS</button>
        <button onClick={signOut} className="ml-auto text-primary-foreground/80 text-sm hover:text-primary-foreground">Logout</button>
      </nav>

      {activeTab === "home" && (
        <div className="p-4 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl overflow-hidden">
            <div className="gradient-orange-pink py-4 text-center">
              <h2 className="text-xl font-bold text-primary-foreground">Total Balance</h2>
              <p className="text-lg text-primary-foreground">Ksh {profile?.balance?.toFixed(2) ?? "0.00"}</p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-background">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm">Your Balance:</span>
                </div>
                <p className="text-lg font-bold text-background">Ksh {profile?.balance?.toFixed(2) ?? "0.00"}</p>
                <div className="flex items-center gap-2 text-background">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm">Loyalty Points:</span>
                </div>
                <p className="text-lg font-bold text-background">{profile?.loyalty_points ?? 0}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => setActiveTab("profile")} className="gradient-orange text-primary-foreground rounded-full px-6 border-0 hover:opacity-90">
                  <span>Profile</span>
                  <User className="h-4 w-4 ml-2" />
                </Button>
                <Button onClick={() => setActiveTab("referrals")} className="gradient-orange text-primary-foreground rounded-full px-6 border-0 hover:opacity-90">
                  <span>Referrals</span>
                  <RefreshCw className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Surveys */}
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-4">
            <h3 className="text-lg font-bold text-background mb-3">Surveys For You Today</h3>

            <div className="gradient-orange-pink rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary-foreground" />
              <span className="text-sm text-primary-foreground">Surveys are automatically filtered based on your location</span>
            </div>

            <div className="space-y-3">
              {surveys.map((survey) => (
                <div key={survey.id} className="bg-foreground/5 rounded-xl p-4 flex items-center justify-between border border-border/10">
                  <div>
                    <h4 className="font-bold text-primary text-base">{survey.title}</h4>
                    <div className="flex items-center gap-1 text-background/70 text-sm mt-1">
                      <HelpCircle className="h-4 w-4" />
                      <span>Questions: <span className="text-primary">{survey.questions}</span></span>
                    </div>
                    <div className="flex items-center gap-1 text-background/70 text-sm mt-1">
                      <Wallet className="h-4 w-4" />
                      <span>Payout: </span>
                      <span className="gradient-orange text-primary-foreground text-xs px-3 py-0.5 rounded-full font-semibold">Ksh {survey.payout}</span>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/survey/${survey.id}`)} className="gradient-orange text-primary-foreground rounded-full px-6 border-0 hover:opacity-90">
                    Take Survey
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="p-4">
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Your Profile</h2>
            <div className="space-y-3 text-background">
              <p><strong>Name:</strong> {profile?.first_name || "N/A"}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Referral Code:</strong> <span className="font-mono text-primary font-bold">{profile?.referral_code || "N/A"}</span></p>
              <p><strong>Balance:</strong> Ksh {profile?.balance?.toFixed(2) ?? "0.00"}</p>
              <p><strong>Loyalty Points:</strong> {profile?.loyalty_points ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "referrals" && (
        <div className="p-4">
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Referrals</h2>
            <p className="text-background mb-4">Share your referral code to earn bonus loyalty points!</p>
            <div className="bg-foreground/90 rounded-xl p-4 text-center">
              <p className="text-sm text-background/50 mb-1">Your Referral Code</p>
              <p className="text-3xl font-bold font-mono text-primary">{profile?.referral_code || "Loading..."}</p>
            </div>
            <p className="text-sm text-background/60 mt-4 text-center">
              When someone signs up with your code, you both earn 200 loyalty points!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
