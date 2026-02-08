import { Button } from "@/components/ui/button";
import { CreditCard, Tag, User, DollarSign } from "lucide-react";

interface QuickStatsBarProps {
  balance: number;
  loyaltyPoints: number;
  onViewProfile: () => void;
  onWithdraw: () => void;
}

const QuickStatsBar = ({ balance, loyaltyPoints, onViewProfile, onWithdraw }: QuickStatsBarProps) => {
  return (
    <div className="bg-gradient-to-b from-[hsl(120,20%,90%)] to-[hsl(120,15%,85%)] rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Balance */}
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-[hsl(192,40%,12%)]/70 text-xs">Balance</span>
          </div>
          <p className="text-xl font-bold text-[hsl(192,40%,12%)]">Ksh {balance.toFixed(2)}</p>
        </div>
        {/* Loyalty Points */}
        <div className="bg-white/60 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Tag className="h-4 w-4 text-primary" />
            <span className="text-[hsl(192,40%,12%)]/70 text-xs">Loyalty Points</span>
          </div>
          <p className="text-xl font-bold text-[hsl(192,40%,12%)]">{loyaltyPoints}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onViewProfile}
          className="gradient-orange text-primary-foreground rounded-full border-0 hover:opacity-90 h-10"
        >
          <User className="h-4 w-4 mr-1" /> Profile
        </Button>
        <Button
          onClick={onWithdraw}
          className="gradient-orange-pink text-primary-foreground rounded-full border-0 hover:opacity-90 h-10"
        >
          <DollarSign className="h-4 w-4 mr-1" /> Withdraw
        </Button>
      </div>
    </div>
  );
};

export default QuickStatsBar;
