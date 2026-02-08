import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Jane from Nairobi",
    stars: 5,
    text: "Attapoll surveys is amazing! I earn Ksh 2,000 weekly from short surveys, and M-Pesa payouts are instant!",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80",
  },
  {
    name: "Peter from Mombasa",
    stars: 4,
    text: "Easy to use and great rewards. I made Ksh 3,500 last month just in my free time!",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80",
  },
  {
    name: "Grace from Kisumu",
    stars: 5,
    text: "The best survey app in Kenya! I've earned Ksh 4,000 this month, highly recommend!",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card rounded-xl p-6 border border-border">
              <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full object-cover mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">{t.name}</h3>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm italic">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
