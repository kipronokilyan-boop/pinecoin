import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart3 } from "lucide-react";

const Referral = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code.trim()) return;

    setLoading(true);

    // Check if referral code exists
    const { data: referrer } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("referral_code", code.trim().toUpperCase())
      .maybeSingle();

    if (!referrer) {
      toast({ title: "Invalid Code", description: "That referral code was not found.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Update user's profile with referral and bonus points
    await supabase
      .from("profiles")
      .update({ referred_by: code.trim().toUpperCase(), loyalty_points: 200 })
      .eq("user_id", user.id);

    toast({ title: "Success!", description: "You earned 200 loyalty points!" });
    navigate("/dashboard");
    setLoading(false);
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] flex flex-col items-center justify-center px-4">
      <div className="bg-foreground/5 rounded-2xl p-8 w-full max-w-md border border-border/20">
        <div className="flex items-center justify-center gap-2 mb-6">
          <BarChart3 className="h-8 w-8 text-background" />
          <span className="text-xl font-bold text-background">SURVEY</span>
        </div>

        <h1 className="text-3xl font-bold text-primary text-center mb-4">
          Get 200 Loyalty Points
        </h1>

        <p className="text-center text-background/70 mb-8">
          If you are invited by someone, please enter your invitation code to earn your first 10 credits
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="referral" className="text-primary font-medium">Referral Code *</Label>
            <Input
              id="referral"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter referral code"
              className="mt-1 bg-foreground/90 text-background border-2 border-secondary h-14 rounded-xl focus:border-secondary"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 rounded-full gradient-orange-pink text-primary-foreground text-lg font-semibold border-0 hover:opacity-90">
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>

        <button onClick={handleSkip} className="block w-full text-center text-primary text-sm mt-4 hover:underline">
          I don't have a referral code
        </button>
      </div>
    </div>
  );
};

export default Referral;
