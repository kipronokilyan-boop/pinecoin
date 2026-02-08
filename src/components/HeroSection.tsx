import { ArrowDown, CheckCircle, Circle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SurveyCard = () => (
  <div className="bg-foreground/95 rounded-xl overflow-hidden shadow-2xl w-64">
    <div className="gradient-orange py-3 px-4 text-center">
      <span className="text-primary-foreground font-bold tracking-wider text-sm">SURVEY</span>
    </div>
    <div className="p-4 space-y-3">
      {[
        { label: "Very Satisfied", checked: true },
        { label: "Satisfied", checked: true },
        { label: "Neutral", checked: false },
        { label: "Dissatisfied", checked: false },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          {item.checked ? (
            <CheckCircle className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/40" />
          )}
          <span className="text-sm text-background">{item.label}</span>
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <div className="gradient-orange rounded-full p-2">
          <DollarSign className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center pt-16 relative overflow-hidden">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
              Earn Money by Sharing Your Opinions
            </h1>
            <p className="text-muted-foreground text-lg mb-2">
              Join the Pinecoin Paid Surveys panel
            </p>
            <p className="text-muted-foreground text-lg mb-2">
              and earn up to Ksh 23,250 /month?
            </p>
            <p className="text-muted-foreground text-lg mb-2">It is possible!</p>
            <p className="text-muted-foreground text-lg mb-6">
              How much would you like to earn?
            </p>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              Your opinions matter! Complete quick surveys and get paid instantly via M-Pesa. Join thousands of Kenyans earning from home.
            </p>

            <ArrowDown className="h-8 w-8 text-muted-foreground mx-auto lg:mx-0 mb-6 animate-bounce" />

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
              <Link to="/register">
                <Button className="gradient-orange text-primary-foreground border-0 px-8 py-3 rounded-full text-base font-semibold hover:opacity-90">
                  Sign Up
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-secondary text-secondary-foreground border-0 px-8 py-3 rounded-full text-base font-semibold hover:opacity-90">
                  Login
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link to="/register">
                <Button className="gradient-orange-pink text-primary-foreground border-0 px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90">
                  Up to Ksh 6,200
                </Button>
              </Link>
              <Link to="/register">
                <Button className="gradient-pink text-primary-foreground border-0 px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90">
                  Up to Ksh 23,250
                </Button>
              </Link>
              <Link to="/register">
                <Button className="gradient-orange-pink text-primary-foreground border-0 px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90">
                  Ksh 23,250 and More
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-shrink-0">
            <SurveyCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
