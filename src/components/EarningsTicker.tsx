const earnings = [
  "John from Nairobi earned Ksh 3,000 this week",
  "Mary from Mombasa earned Ksh 2,500 yesterday",
  "David from Kisumu earned Ksh 4,000 last month",
  "Sarah from Eldoret earned Ksh 2,800 this week",
  "Michael from Nakuru earned Ksh 3,500 last month",
];

const EarningsTicker = () => {
  return (
    <div className="py-6 overflow-hidden bg-card/50 border-y border-border">
      <div className="animate-scroll-left flex whitespace-nowrap gap-8">
        {[...earnings, ...earnings].map((text, i) => (
          <span key={i} className="text-muted-foreground text-sm inline-block px-4 py-2 rounded-full bg-muted">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EarningsTicker;
