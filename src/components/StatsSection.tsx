const StatsSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Our Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <h3 className="text-sm text-muted-foreground mb-2">Surveys Launched</h3>
            <p className="text-4xl font-bold text-primary">5,000</p>
          </div>
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <h3 className="text-sm text-muted-foreground mb-2">Registered Users</h3>
            <p className="text-4xl font-bold text-primary">100,000</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
