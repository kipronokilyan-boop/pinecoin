import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, User, RefreshCw, Clock, HelpCircle, Wallet, Tag, Star, DollarSign, CreditCard, ListChecks, Plus } from "lucide-react";

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
  last_name: string;
  referral_code: string;
  mpesa_phone: string | null;
  mpesa_name: string | null;
  account_tier: string;
  daily_survey_limit: number;
}

const tierLabels: Record<string, string> = {
  free: "Free Account",
  business_basic: "Business Basic",
  business_premium: "Business Premium",
  business_expert: "Business Expert",
  platinum: "PLATINUM",
};

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [completedCount, setCompletedCount] = useState(0);
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [mpesaNameInput, setMpesaNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [surveyRes, profileRes, completionsRes] = await Promise.all([
        supabase.from("surveys").select("*").eq("is_active", true),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("survey_completions").select("id").eq("user_id", user.id),
      ]);
      if (surveyRes.data) setSurveys(surveyRes.data);
      if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
      if (completionsRes.data) setCompletedCount(completionsRes.data.length);
    };
    fetchData();
  }, [user]);

  const handleSaveMpesa = async () => {
    if (!user || !phoneInput.trim() || !mpesaNameInput.trim()) return;
    const cleaned = phoneInput.trim();
    if (!/^(07|01|2547|2541)\d{7,8}$/.test(cleaned)) {
      alert("Please enter a valid M-Pesa phone number");
      return;
    }
    setSavingPhone(true);
    await supabase.from("profiles").update({ mpesa_phone: cleaned, mpesa_name: mpesaNameInput.trim() } as any).eq("user_id", user.id);
    setProfile((p) => p ? { ...p, mpesa_phone: cleaned, mpesa_name: mpesaNameInput.trim() } : p);
    setShowMpesaDialog(false);
    setPhoneInput("");
    setMpesaNameInput("");
    setSavingPhone(false);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>;
  }

  const availableSurveys = surveys.length - completedCount;

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
          {/* Surveys list */}
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-4">
            <h3 className="text-lg font-bold text-[hsl(192,40%,12%)] mb-3">Surveys For You Today</h3>
            <div className="gradient-orange-pink rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary-foreground" />
              <span className="text-sm text-primary-foreground">Surveys are automatically filtered based on your location</span>
            </div>
            <div className="space-y-3">
              {surveys.map((survey) => (
                <div key={survey.id} className="bg-foreground/5 rounded-xl p-4 flex items-center justify-between border border-border/10">
                  <div>
                    <h4 className="font-bold text-primary text-base">{survey.title}</h4>
                    <div className="flex items-center gap-1 text-[hsl(192,40%,12%)]/70 text-sm mt-1">
                      <HelpCircle className="h-4 w-4" />
                      <span>Questions: <span className="text-primary">{survey.questions}</span></span>
                    </div>
                    <div className="flex items-center gap-1 text-[hsl(192,40%,12%)]/70 text-sm mt-1">
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
        <div className="p-4 space-y-4">
          {/* Profile Card - like reference */}
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-6 space-y-6">
            {/* Name & email */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-primary">{profile?.first_name} {profile?.last_name}</h2>
              </div>
              <p className="text-[hsl(192,40%,12%)]/60 text-sm ml-7">{user?.email}</p>
            </div>

            {/* Account type row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[hsl(192,40%,12%)]/70 text-sm">Account type:</p>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[hsl(192,40%,12%)]" />
                  <span className="font-bold text-[hsl(192,40%,12%)]">{tierLabels[profile?.account_tier ?? "free"] ?? "Free Account"}</span>
                </div>
                <span className="inline-block mt-1 gradient-orange text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">{profile?.daily_survey_limit ?? 1} surveys per day</span>
              </div>
              <Button onClick={() => navigate("/packages")} className="gradient-orange-pink text-primary-foreground rounded-full px-6 py-3 border-0 hover:opacity-90 text-base">
                Upgrade <Star className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Balance row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[hsl(192,40%,12%)]/70 text-sm">Account Balance:</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[hsl(192,40%,12%)]" />
                  <span className="font-bold text-[hsl(192,40%,12%)] text-lg">Ksh {profile?.balance?.toFixed(2) ?? "0.00"}</span>
                </div>
              </div>
              <Button className="gradient-orange-pink text-primary-foreground rounded-full px-6 py-3 border-0 hover:opacity-90 text-base">
                Withdraw <DollarSign className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Available surveys row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[hsl(192,40%,12%)]/70 text-sm">Available Surveys:</p>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-[hsl(192,40%,12%)]" />
                  <span className="font-bold text-[hsl(192,40%,12%)] text-lg">{availableSurveys > 0 ? availableSurveys : surveys.length}</span>
                </div>
              </div>
              <Button onClick={() => setActiveTab("home")} className="gradient-orange-pink text-primary-foreground rounded-full px-6 py-3 border-0 hover:opacity-90 text-base">
                Surveys <ListChecks className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Loyalty points row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[hsl(192,40%,12%)]/70 text-sm">Loyalty points:</p>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-[hsl(192,40%,12%)]" />
                  <span className="font-bold text-[hsl(192,40%,12%)] text-lg">{profile?.loyalty_points ?? 0}</span>
                </div>
              </div>
              <Button onClick={() => setActiveTab("referrals")} className="gradient-orange-pink text-primary-foreground rounded-full px-6 py-3 border-0 hover:opacity-90 text-base">
                Referrals <RefreshCw className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Payments row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[hsl(192,40%,12%)]/70 text-sm">Payments details:</p>
                {profile?.mpesa_phone ? (
                  <div>
                    <span className="font-bold text-[hsl(192,40%,12%)]">{profile.mpesa_name}</span>
                    <p className="text-[hsl(192,40%,12%)]/70 text-sm">{profile.mpesa_phone}</p>
                  </div>
                ) : (
                  <span className="font-bold text-[hsl(192,40%,12%)]">Not Provided</span>
                )}
              </div>
              <Button onClick={() => setShowMpesaDialog(true)} className="gradient-orange-pink text-primary-foreground rounded-full px-6 py-3 border-0 hover:opacity-90 text-base">
                Add <Plus className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Currency notice */}
          <div className="gradient-orange-pink rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-sm text-primary-foreground">💰 Currency is based on your country for convenience</span>
          </div>

          {/* Transaction History placeholder */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Transactions History</h3>
            <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-4">
              <p className="text-[hsl(192,40%,12%)]/60 text-sm text-center">No transactions yet</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "referrals" && (
        <div className="p-4">
          <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Referrals</h2>
            <p className="text-[hsl(192,40%,12%)] mb-4">Share your referral code to earn bonus loyalty points!</p>
            <div className="bg-foreground/90 rounded-xl p-4 text-center">
              <p className="text-sm text-[hsl(192,40%,12%)]/50 mb-1">Your Referral Code</p>
              <p className="text-3xl font-bold font-mono text-primary">{profile?.referral_code || "Loading..."}</p>
            </div>
            <p className="text-sm text-[hsl(192,40%,12%)]/60 mt-4 text-center">
              When someone signs up with your code, you both earn 200 loyalty points!
            </p>
          </div>
        </div>
      )}

      {/* M-Pesa Dialog */}
      <Dialog open={showMpesaDialog} onOpenChange={setShowMpesaDialog}>
        <DialogContent className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] border-none max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-primary text-xl">Add M-Pesa Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[hsl(192,40%,12%)]/70 text-sm block mb-1">Full Name (as on M-Pesa)</label>
              <input
                type="text"
                placeholder="e.g. John Kamau"
                value={mpesaNameInput}
                onChange={(e) => setMpesaNameInput(e.target.value)}
                className="w-full bg-white/80 text-[hsl(192,40%,12%)] rounded-xl px-4 py-3 text-sm border border-border/30"
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-[hsl(192,40%,12%)]/70 text-sm block mb-1">M-Pesa Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 0712345678"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full bg-white/80 text-[hsl(192,40%,12%)] rounded-xl px-4 py-3 text-sm border border-border/30"
                maxLength={13}
              />
            </div>
            <Button
              onClick={handleSaveMpesa}
              disabled={savingPhone || !phoneInput.trim() || !mpesaNameInput.trim()}
              className="w-full h-12 rounded-full gradient-orange-pink text-primary-foreground text-base font-semibold border-0 hover:opacity-90 disabled:opacity-50"
            >
              {savingPhone ? "Saving..." : "Save Payment Details"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
