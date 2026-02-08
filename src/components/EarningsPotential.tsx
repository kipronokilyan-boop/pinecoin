const EarningsPotential = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Earnings Potential</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Earn Ksh 500-3,000 Daily</h3>
            <p className="text-muted-foreground text-sm">Complete surveys and earn rewards from anywhere.</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Per Survey: Ksh 50-500</h3>
            <p className="text-muted-foreground text-sm">Each survey pays based on length and complexity.</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Success Stories</h3>
            <p className="text-muted-foreground text-sm">Michael from Nairobi earns Ksh 25,000 monthly, Susan from Nakuru earns Ksh 2,500 daily, David from Mombasa withdrew Ksh 80,000 in 3 months.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EarningsPotential;
