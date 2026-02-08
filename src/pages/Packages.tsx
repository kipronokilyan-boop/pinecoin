import { useNavigate } from "react-router-dom";
import { BarChart3, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const packages = [
  {
    name: "Business Basic",
    price: "Ksh 200",
    surveysPerDay: 10,
    earningsPerMonth: "Ksh 8,000",
    dailyIncome: "Ksh 250",
    minWithdrawal: "Ksh 3,000",
    earningsPerSurvey: "Ksh 50 - 100",
  },
  {
    name: "Business Premium",
    price: "Ksh 400",
    surveysPerDay: 15,
    earningsPerMonth: "Ksh 15,000",
    dailyIncome: "Ksh 500",
    minWithdrawal: "Ksh 2,500",
    earningsPerSurvey: "Ksh 50 - 100",
  },
  {
    name: "Business Expert",
    price: "Ksh 800",
    surveysPerDay: 20,
    earningsPerMonth: "Ksh 30,000",
    dailyIncome: "Ksh 1,500",
    minWithdrawal: "Ksh 2,000",
    earningsPerSurvey: "Ksh 50 - 100",
  },
  {
    name: "PLATINUM",
    price: "Ksh 1,200",
    surveysPerDay: 40,
    earningsPerMonth: "Ksh 60,000",
    dailyIncome: "Ksh 3,000",
    minWithdrawal: "Ksh 1,000",
    earningsPerSurvey: "Ksh 100 - 150",
  },
];

const Packages = () => {
  const navigate = useNavigate();

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
                <span className="text-lg font-bold text-[hsl(192,40%,12%)]">{pkg.price}</span>
                <Button className="gradient-orange-pink text-primary-foreground rounded-full px-6 border-0 hover:opacity-90">
                  Start now <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Packages;
