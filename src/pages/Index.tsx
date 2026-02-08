import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import EarningsTicker from "@/components/EarningsTicker";
import StatsSection from "@/components/StatsSection";
import HowItWorks from "@/components/HowItWorks";
import EarningsPotential from "@/components/EarningsPotential";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <EarningsTicker />
      <StatsSection />
      <HowItWorks />
      <EarningsPotential />
      <TestimonialsSection />
      <FAQSection />
    </div>
  );
};

export default Index;
