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
    <div className="fixed top-12 sm:top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pointer-events-auto backdrop-blur-2xl bg-background/60 border border-white/15 dark:border-white/10 shadow-2xl rounded-full px-4 sm:px-6 py-2 sm:py-3 min-w-[280px] max-w-[95%] sm:max-w-max transition-colors duration-700"
      >
        <div className="flex items-center justify-between gap-4 sm:gap-10">
          <motion.div
            className="flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-foreground">
              EMI<span className="text-primary">Q</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCurrencies(!showCurrencies)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-secondary/40 text-secondary-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-secondary border border-border/50"
              >
                <span className="text-primary">{currencies[currency].symbol}</span>
                <span className="hidden sm:inline">{currency}</span>
                <ChevronDown size={10} className={`transition-transform duration-300 ${showCurrencies ? "rotate-180" : ""}`} />
              </motion.button>

              <AnimatePresence>
                {showCurrencies && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-3 right-0 w-32 glass-card-elevated overflow-hidden z-50 !rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl"
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
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-secondary/40 text-secondary-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-secondary border border-border/50"
              title="Toggle format"
            >
              {numberFormat === "indian" ? "IND" : "INT"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDark}
              className="p-1.5 sm:p-2 rounded-full bg-secondary/40 text-secondary-foreground transition-all hover:bg-secondary border border-border/50 relative overflow-hidden"
              title="Toggle theme"
            >
              <motion.div
                initial={false}
                animate={{ y: dark ? 0 : 25, opacity: dark ? 1 : 0 }}
                transition={{ duration: 0.4, ease: "backOut" }}
              >
                <Sun size={14} />
              </motion.div>
              <motion.div
                initial={false}
                animate={{ y: dark ? -25 : 0, opacity: dark ? 0 : 1 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Moon size={14} />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.header>
    </div>
  );
}
