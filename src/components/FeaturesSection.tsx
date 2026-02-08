import { Zap, Shield, Clock, MapPin, Star, Gift } from "lucide-react";

const features = [
  { icon: Zap, title: "Instant Payments", desc: "Get paid instantly via M-Pesa with no minimum withdrawal amount." },
  { icon: Shield, title: "Secure & Trusted", desc: "Your data is protected with bank-level security. Trusted by 100,000+ users." },
  { icon: Clock, title: "Quick Surveys", desc: "Complete surveys in just 2-5 minutes and earn Ksh 50-500 per survey." },
  { icon: MapPin, title: "Kenya Focused", desc: "Surveys tailored for Kenyan users with local brands and topics." },
  { icon: Star, title: "High Ratings", desc: "4.8/5 star rating from our community. Join thousands of satisfied users." },
  { icon: Gift, title: "Multiple Rewards", desc: "Earn through surveys, referrals, and special offers. More ways to earn!" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Why Choose Attapoll surveys?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors">
              <div className="gradient-orange rounded-lg p-3 w-fit mb-4">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
