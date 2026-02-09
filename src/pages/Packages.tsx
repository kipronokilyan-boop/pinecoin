import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Check, ChevronRight, Loader2, Phone, CheckCircle2, XCircle } from "lucide-react";
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

type PaymentStep = "phone" | "processing" | "success" | "failed";

const Packages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPkg, setSelectedPkg] = useState<typeof packages[0] | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<PaymentStep>("phone");
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const handleStartPayment = (pkg: typeof packages[0]) => {
    setSelectedPkg(pkg);
    setStep("phone");
    setPhoneNumber("");
    setReference(null);
  };

  const handleCloseDialog = (open: boolean) => {
    if (!open) {
      setSelectedPkg(null);
      setPolling(false);
      setReference(null);
    }
  };

  const handleSendSTK = async () => {
    if (!selectedPkg || !phoneNumber.trim() || !user) return;

    const cleaned = phoneNumber.trim();
    if (!/^(07|01|2547|2541)\d{7,8}$/.test(cleaned)) {
      toast({ title: "Invalid number", description: "Please enter a valid M-Pesa phone number", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("initiate-stk-push", {
        body: {
          phone_number: cleaned,
          package_name: selectedPkg.name,
          amount: selectedPkg.price,
        },
      });

      if (error) {
        toast({ title: "Error", description: error.message || "Failed to send payment request", variant: "destructive" });
        setSending(false);
        return;
      }

      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        setSending(false);
        return;
      }

      setReference(data.reference);
      setStep("processing");
      setPolling(true);
      toast({ title: "Check your phone!", description: "Enter your M-Pesa PIN to complete payment." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to initiate payment. Please try again.", variant: "destructive" });
    }
    setSending(false);
  };

  // Poll for payment status
  const checkPaymentStatus = useCallback(async () => {
    if (!reference) return;

    const { data, error } = await supabase
      .from("upgrade_requests")
      .select("status")
      .eq("mpesa_message", reference)
      .maybeSingle();

    if (error) {
      console.error("Error checking payment status:", error);
      return;
    }

    if (data?.status === "verified") {
      setStep("success");
      setPolling(false);
    } else if (data?.status === "failed") {
      setStep("failed");
      setPolling(false);
    }
  }, [reference]);

  useEffect(() => {
    if (!polling || !reference) return;

    const interval = setInterval(checkPaymentStatus, 3000);
    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      setPolling(false);
      if (step === "processing") {
        setStep("failed");
        toast({ title: "Payment timeout", description: "We didn't receive confirmation. If you paid, it will be processed shortly.", variant: "destructive" });
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [polling, reference, checkPaymentStatus, step, toast]);

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
      <Dialog open={!!selectedPkg} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] border-none max-w-[90vw] sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary text-xl">
              {step === "phone" && "M-Pesa Payment"}
              {step === "processing" && "Processing Payment"}
              {step === "success" && "Payment Successful!"}
              {step === "failed" && "Payment Failed"}
            </DialogTitle>
          </DialogHeader>

          {step === "phone" && selectedPkg && (
            <div className="space-y-4 pt-2">
              <div className="bg-white/60 rounded-xl p-4 space-y-2">
                <p className="text-[hsl(192,40%,12%)] text-sm">
                  Upgrading to <strong>{selectedPkg.name}</strong>
                </p>
                <p className="text-2xl font-bold text-primary">Ksh {selectedPkg.price.toLocaleString()}</p>
                <p className="text-[hsl(192,40%,12%)]/70 text-xs">
                  An M-Pesa payment prompt will be sent to your phone. Enter your PIN to complete.
                </p>
              </div>

              <div>
                <label className="text-[hsl(192,40%,12%)]/70 text-sm block mb-1">M-Pesa Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(192,40%,12%)]/50" />
                  <input
                    type="tel"
                    placeholder="e.g. 0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-white/80 text-[hsl(192,40%,12%)] rounded-xl pl-10 pr-4 py-3 text-sm border border-border/30"
                    maxLength={13}
                  />
                </div>
              </div>

              <Button
                onClick={handleSendSTK}
                disabled={sending || !phoneNumber.trim()}
                className="w-full h-12 rounded-full gradient-orange-pink text-primary-foreground text-base font-semibold border-0 hover:opacity-90 disabled:opacity-50"
              >
                {sending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</> : "Pay Now"}
              </Button>
            </div>
          )}

          {step === "processing" && (
            <div className="space-y-4 pt-2 text-center">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <p className="text-[hsl(192,40%,12%)] font-semibold">Check your phone</p>
              <p className="text-[hsl(192,40%,12%)]/70 text-sm">
                An M-Pesa payment prompt has been sent to your phone. Enter your PIN to complete the payment.
              </p>
              <p className="text-[hsl(192,40%,12%)]/50 text-xs">Waiting for confirmation...</p>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4 pt-2 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
              <p className="text-[hsl(192,40%,12%)] font-bold text-lg">Payment Successful!</p>
              <p className="text-[hsl(192,40%,12%)]/70 text-sm">
                Your account has been upgraded to <strong>{selectedPkg?.name}</strong>. Enjoy your new benefits!
              </p>
              <Button
                onClick={() => {
                  setSelectedPkg(null);
                  navigate("/dashboard");
                }}
                className="w-full h-12 rounded-full gradient-orange text-primary-foreground text-base font-semibold border-0 hover:opacity-90"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {step === "failed" && (
            <div className="space-y-4 pt-2 text-center">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
              <p className="text-[hsl(192,40%,12%)] font-bold text-lg">Payment Failed</p>
              <p className="text-[hsl(192,40%,12%)]/70 text-sm">
                The payment was not completed. Please try again.
              </p>
              <Button
                onClick={() => {
                  setStep("phone");
                  setReference(null);
                }}
                className="w-full h-12 rounded-full gradient-orange-pink text-primary-foreground text-base font-semibold border-0 hover:opacity-90"
              >
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;
