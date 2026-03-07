import { useState, useCallback, useEffect } from "react";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NumberFormat, Currency } from "@/lib/loanCalculations";
import { currencies } from "@/lib/loanCalculations";

interface HeaderProps {
  numberFormat: NumberFormat;
  onFormatChange: (f: NumberFormat) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
}

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`relative ${className} group`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#logoGrad)" strokeWidth="8" strokeLinecap="round" className="opacity-20" />
      <motion.path
        d="M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.path
        d="M75 75 L95 95"
        stroke="url(#logoGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      />
      <motion.circle
        cx="50"
        cy="45"
        r="12"
        fill="url(#logoGrad)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.5 }}
      />
      <motion.path
        d="M38 45 L30 45 M62 45 L70 45 M50 33 L50 25 M50 57 L50 65"
        stroke="url(#logoGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      />
    </svg>
    <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl group-hover:bg-primary/40 transition-colors duration-500 -z-10" />
  </div>
);

export default function Header({ 
  numberFormat, 
  onFormatChange, 
  currency, 
  onCurrencyChange 
}: HeaderProps) {
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [showCurrencies, setShowCurrencies] = useState(false);

  const toggleDark = useCallback(() => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches && !document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-background/40 border-b border-white/10 dark:border-white/5 transition-all duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Logo className="w-12 h-12" />
          <span className="text-3xl font-black tracking-tighter text-foreground">
            EMI<span className="text-primary">Q</span>
          </span>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCurrencies(!showCurrencies)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/50 text-secondary-foreground text-sm font-bold transition-all hover:bg-secondary border border-border/50"
            >
              <span className="text-primary">{currencies[currency].symbol}</span>
              <span className="tracking-tight">{currency}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showCurrencies ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
              {showCurrencies && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 w-32 glass-card-elevated overflow-hidden z-50 !rounded-2xl border border-border/50 bg-background/90 backdrop-blur-xl"
                >
                  {(Object.keys(currencies) as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onCurrencyChange(c);
                        setShowCurrencies(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-xs font-black tracking-widest hover:bg-primary/10 transition-colors border-b border-border/10 last:border-0 ${
                        currency === c ? "text-primary bg-primary/5" : "text-foreground/70"
                      }`}
                    >
                      <span className="mr-2 text-primary">{currencies[c].symbol}</span>
                      {c}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFormatChange(numberFormat === "indian" ? "western" : "indian")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-secondary/50 text-secondary-foreground text-sm font-bold transition-all hover:bg-secondary border border-border/50"
            title="Toggle number format"
          >
            <span className="font-black">{numberFormat === "indian" ? "IND" : "INT"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDark}
            className="p-3 rounded-2xl bg-secondary/50 text-secondary-foreground transition-all hover:bg-secondary border border-border/50 relative overflow-hidden"
            title="Toggle theme"
          >
            <motion.div
              initial={false}
              animate={{ y: dark ? 0 : 30, opacity: dark ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "backOut" }}
            >
              <Sun size={20} />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ y: dark ? -30 : 0, opacity: dark ? 0 : 1 }}
              transition={{ duration: 0.4, ease: "backOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon size={20} />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
