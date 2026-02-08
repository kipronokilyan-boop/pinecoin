import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const fakeTransactions = [
  { phone: "2547XX***782", amount: "8,000", balance: "320", ref: "TX8000AB" },
  { phone: "2541XX***459", amount: "3,500", balance: "1,200", ref: "TX3500CD" },
  { phone: "2547XX***913", amount: "12,000", balance: "540", ref: "TX1200EF" },
  { phone: "2540XX***321", amount: "5,200", balance: "890", ref: "TX5200GH" },
  { phone: "2547XX***645", amount: "1,800", balance: "2,100", ref: "TX1800IJ" },
  { phone: "2541XX***208", amount: "6,700", balance: "150", ref: "TX6700KL" },
  { phone: "2547XX***557", amount: "4,300", balance: "3,400", ref: "TX4300MN" },
  { phone: "2540XX***874", amount: "9,500", balance: "780", ref: "TX9500OP" },
  { phone: "2547XX***196", amount: "2,000", balance: "4,600", ref: "TX2000QR" },
  { phone: "2541XX***733", amount: "7,100", balance: "260", ref: "TX7100ST" },
];

const LiveTransactionTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % fakeTransactions.length);
        setVisible(true);
      }, 600);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const tx = fakeTransactions[currentIndex];

  return (
    <div className="fixed top-3 right-3 z-50 flex justify-end">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="max-w-xs gradient-orange-pink rounded-2xl px-4 py-2.5 text-center shadow-lg"
          >
            <p className="text-[hsl(192,40%,12%)] font-semibold text-xs leading-relaxed">
              {tx.phone} has withdrawn Ksh {tx.amount}.
              <br />
              New balance: Ksh {tx.balance}. Ref: {tx.ref}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveTransactionTicker;
