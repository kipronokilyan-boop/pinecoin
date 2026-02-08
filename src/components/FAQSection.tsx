import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Is it free to join Pinecoin Paid Surveys?", a: "Yes, joining is completely free with no hidden fees." },
  { q: "How do I get paid?", a: "You can cash out instantly via M-Pesa, PayPal, or gift cards with no minimum threshold." },
  { q: "Are there any hidden fees?", a: "No, Pinecoin Paid Surveys has no hidden fees. You keep what you earn." },
  { q: "How much can I earn?", a: "You can earn Ksh 500-3,000 daily, with top earners making up to Ksh 23,250 monthly through surveys and referrals." },
  { q: "Is my data safe?", a: "Yes, your data is protected with bank-level encryption and we never share your personal information." },
];

const FAQSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-4">
              <AccordionTrigger className="text-foreground text-left hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
