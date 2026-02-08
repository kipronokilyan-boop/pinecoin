import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { DollarSign } from "lucide-react";

const tierMinWithdrawal: Record<string, number> = {
  free: 500,
  business_basic: 300,
  business_premium: 200,
  business_expert: 100,
  platinum: 50,
};

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  accountTier: string;
  mpesaPhone: string | null;
  mpesaName: string | null;
  onNeedPaymentDetails: () => void;
}

const WithdrawDialog = ({
  open,
  onOpenChange,
  balance,
  accountTier,
  mpesaPhone,
  mpesaName,
  onNeedPaymentDetails,
}: WithdrawDialogProps) => {
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const minAmount = tierMinWithdrawal[accountTier] ?? 500;

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }
    if (numAmount < minAmount) {
      toast({ title: "Below minimum", description: `Minimum withdrawal for your plan is Ksh ${minAmount}.`, variant: "destructive" });
      return;
    }
    if (numAmount > balance) {
      toast({ title: "Insufficient balance", description: `Your balance is Ksh ${balance.toFixed(2)}.`, variant: "destructive" });
      return;
    }

    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      toast({ title: "Withdrawal Submitted", description: `Ksh ${numAmount.toFixed(2)} will be sent to ${mpesaPhone} (${mpesaName}).` });
      setProcessing(false);
      setAmount("");
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] border-none max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Withdraw Funds
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {!mpesaPhone ? (
            <div className="text-center space-y-3">
              <p className="text-[hsl(192,40%,12%)] text-sm">You need to add your M-Pesa payment details before withdrawing.</p>
              <Button
                onClick={() => { onOpenChange(false); onNeedPaymentDetails(); }}
                className="w-full h-12 rounded-full gradient-orange text-primary-foreground text-base font-semibold border-0 hover:opacity-90"
              >
                Add Payment Details
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white/60 rounded-xl p-3 text-sm text-[hsl(192,40%,12%)]">
                <p>Sending to: <strong>{mpesaName}</strong> ({mpesaPhone})</p>
                <p className="mt-1">Balance: <strong>Ksh {balance.toFixed(2)}</strong></p>
                <p className="mt-1">Min withdrawal: <strong>Ksh {minAmount}</strong></p>
              </div>
              <div>
                <label className="text-[hsl(192,40%,12%)]/70 text-sm block mb-1">Amount (Ksh)</label>
                <input
                  type="number"
                  placeholder={`Min Ksh ${minAmount}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/80 text-[hsl(192,40%,12%)] rounded-xl px-4 py-3 text-sm border border-border/30"
                  min={minAmount}
                  max={balance}
                />
              </div>
              <Button
                onClick={handleWithdraw}
                disabled={processing || !amount}
                className="w-full h-12 rounded-full gradient-orange-pink text-primary-foreground text-base font-semibold border-0 hover:opacity-90 disabled:opacity-50"
              >
                {processing ? "Processing..." : "Withdraw"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
