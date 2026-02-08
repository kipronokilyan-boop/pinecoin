import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Check, ChevronRight, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const packages = [
  {
    name: "Business Basic",
    price: 200,
    surveysPerDay: 10,
    earningsPerMonth: "Ksh 8,000",
    dailyIncome: "Ksh 250",
    minWithdrawal: "Ksh 3,000",
    earningsPerSurvey: "Ksh 50 - 100",
  },
  {
    name: "Business Premium",
    price: 400,
    surveysPerDay: 15,
    earningsPerMonth: "Ksh 15,000",
    dailyIncome: "Ksh 500",
    minWithdrawal: "Ksh 2,500",
    earningsPerSurvey: "Ksh 50 - 100",
  },
  {
    name: "Business Expert",
    price: 800,
    surveysPerDay: 20,
    earningsPerMonth: "Ksh 30,000",
    dailyIncome: "Ksh 1,500",
    minWithdrawal: "Ksh 2,000",
    earningsPerSurvey: "Ksh 50 - 100",
  },
  {
    name: "PLATINUM",
    price: 1200,
    surveysPerDay: 40,
    earningsPerMonth: "Ksh 60,000",
    dailyIncome: "Ksh 3,000",
    minWithdrawal: "Ksh 1,000",
    earningsPerSurvey: "Ksh 100 - 150",
  },
];

const Packages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPkg, setSelectedPkg] = useState<typeof packages[0] | null>(null);
  const [mpesaMessage, setMpesaMessage] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<"instructions" | "verify">("instructions");

  const handleStartPayment = (pkg: typeof packages[0]) => {
    setSelectedPkg(pkg);
    setStep("instructions");
    setMpesaMessage("");
  };

  const handleVerify = async () => {
    if (!selectedPkg || !mpesaMessage.trim() || !user) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-mpesa-payment", {
        body: { mpesa_message: mpesaMessage.trim(), package_name: selectedPkg.name },
      });

      if (error) {
        toast({ title: "Verification Failed", description: error.message || "Something went wrong", variant: "destructive" });
        setVerifying(false);
        return;
      }

      if (data?.error) {
        toast({ title: "Verification Failed", description: data.error, variant: "destructive" });
        setVerifying(false);
        return;
      }

      toast({ title: "🎉 Upgrade Successful!", description: data.message });
      setSelectedPkg(null);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (e) {
      toast({ title: "Error", description: "Failed to verify payment. Please try again.", variant: "destructive" });
    }
    setVerifying(false);
  };

  const copyTill = () => {
    navigator.clipboard.writeText("3106479");
    toast({ title: "Copied!", description: "Till number copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="gradient-orange px-4 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary-foreground" />
          <span className="font-bold text-primary-foreground">PINECOIN</span>
        </div>
        <button onClick={() => navigate("/dashboard")} className="ml-auto text-primary-foreground/80 text-sm hover:text-primary-foreground">
          ← Back to Dashboard
        </button>
      </nav>

      <div className="p-4">
        <h1 className="text-2xl font-bold text-foreground text-center mb-6">Select Package</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.name} className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-6 flex flex-col">
              <h2 className="text-xl font-bold text-primary mb-4">{pkg.name}</h2>

              <div className="space-y-3 flex-1 text-sm text-[hsl(192,40%,12%)]">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Surveys per day: <strong>{pkg.surveysPerDay}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Earnings per month: <strong>{pkg.earningsPerMonth}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Daily income: <strong>{pkg.dailyIncome}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Minimum withdrawals: <strong>{pkg.minWithdrawal}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Earnings per survey: <strong>{pkg.earningsPerSurvey}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="text-lg font-bold text-[hsl(192,40%,12%)]">Ksh {pkg.price.toLocaleString()}</span>
                <Button onClick={() => handleStartPayment(pkg)} className="gradient-orange-pink text-primary-foreground rounded-full px-6 border-0 hover:opacity-90">
                  Start now <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedPkg} onOpenChange={(open) => !open && setSelectedPkg(null)}>
        <DialogContent className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] border-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary text-xl">
              {step === "instructions" ? "M-Pesa Payment" : "Verify Payment"}
            </DialogTitle>
          </DialogHeader>

          {step === "instructions" && selectedPkg && (
            <div className="space-y-4 pt-2">
              <div className="bg-white/60 rounded-xl p-4 space-y-3">
                <p className="text-[hsl(192,40%,12%)] text-sm font-semibold">Follow these steps:</p>
                <ol className="text-[hsl(192,40%,12%)]/80 text-sm space-y-2 list-decimal list-inside">
                  <li>Go to M-Pesa on your phone</li>
                  <li>Select <strong>Lipa na M-Pesa</strong></li>
                  <li>Select <strong>Buy Goods and Services</strong></li>
                  <li>Enter Till Number:</li>
                </ol>

                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3">
                  <div>
                    <p className="text-xs text-[hsl(192,40%,12%)]/60">Till Number</p>
                    <p className="text-2xl font-bold text-primary font-mono">3106479</p>
                    <p className="text-xs text-[hsl(192,40%,12%)]/60">ECERTIFY INC</p>
                  </div>
                  <button onClick={copyTill} className="gradient-orange text-primary-foreground rounded-full p-2 hover:opacity-90">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <ol start={5} className="text-[hsl(192,40%,12%)]/80 text-sm space-y-2 list-decimal list-inside">
                  <li>Enter Amount: <strong>Ksh {selectedPkg.price.toLocaleString()}</strong></li>
                  <li>Enter your M-Pesa PIN and confirm</li>
                  <li>You will receive a confirmation SMS</li>
                </ol>
              </div>

              <Button
                onClick={() => setStep("verify")}
                className="w-full h-12 rounded-full gradient-orange-pink text-primary-foreground text-base font-semibold border-0 hover:opacity-90"
              >
                I've Made the Payment
              </Button>
            </div>
          )}

          {step === "verify" && selectedPkg && (
            <div className="space-y-4 pt-2">
              <p className="text-[hsl(192,40%,12%)]/80 text-sm">
                Paste the <strong>full M-Pesa confirmation SMS</strong> you received below to verify your payment:
              </p>

              <textarea
                placeholder="e.g. ABC12XYZ34 Confirmed. Ksh200.00 sent to ECERTIFY INC for account..."
                value={mpesaMessage}
                onChange={(e) => setMpesaMessage(e.target.value)}
                className="w-full bg-white/80 text-[hsl(192,40%,12%)] rounded-xl px-4 py-3 text-sm border border-border/30 min-h-[120px] resize-none"
                maxLength={500}
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep("instructions")}
                  variant="outline"
                  className="flex-1 h-12 rounded-full border-primary/30 text-[hsl(192,40%,12%)]"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={verifying || !mpesaMessage.trim()}
                  className="flex-1 h-12 rounded-full gradient-orange-pink text-primary-foreground text-base font-semibold border-0 hover:opacity-90 disabled:opacity-50"
                >
                  {verifying ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...</> : "Verify Payment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
