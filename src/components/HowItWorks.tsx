const steps = [
  { num: 1, title: "Sign Up", desc: "Join for free in under 2 minutes." },
  { num: 2, title: "Complete Profile", desc: "Fill out your profile to unlock surveys." },
  { num: 3, title: "Take Surveys", desc: "Earn points by sharing your opinions." },
  { num: 4, title: "Cash Out", desc: "Withdraw instantly via M-Pesa with no minimum threshold." },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="gradient-orange w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-lg">
                {s.num}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
