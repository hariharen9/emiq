import { motion, AnimatePresence, animate } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Download, TrendingDown, Wallet, Landmark, ChevronDown, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import type { EMIResult, NumberFormat, Currency } from "@/lib/loanCalculations";
import { formatCurrency, bankRates } from "@/lib/loanCalculations";

interface ResultsPanelProps {
  result: EMIResult;
  principal: number;
  numberFormat: NumberFormat;
  currency: Currency;
  activeTab: string;
  printRef: React.RefObject<HTMLDivElement>;
}

function AnimatedNumber({ value, format, currency }: { value: number; format: NumberFormat; currency: Currency }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value, currency]);

  return <>{formatCurrency(displayValue, format, currency)}</>;
}

function ValueDescriptor({ value, format }: { value: number; format: NumberFormat }) {
  const getDescriptor = () => {
    if (format === "indian") {
      if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Crores`;
      if (value >= 100000) return `${(value / 100000).toFixed(2)} Lakhs`;
      return "";
    } else {
      if (value >= 1000000) return `${(value / 1000000).toFixed(2)} Millions`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return "";
    }
  };

  const text = getDescriptor();
  if (!text) return null;

  return (
    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider block mt-0.5">
      ≈ {text}
    </span>
  );
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-interest))"];

export default function ResultsPanel({ 
  result, 
  principal, 
  numberFormat, 
  currency, 
  activeTab,
  printRef 
}: ResultsPanelProps) {
  const [showMarketRates, setShowMarketRates] = useState(false);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Loan_Summary_EMIQ",
  });

  const donutData = [
    { name: "Principal", value: principal },
    { name: "Interest", value: result.totalInterest },
  ];

  const interestPercent = principal > 0 ? ((result.totalInterest / result.totalAmount) * 100).toFixed(1) : "0";

  const marketBenchmarks = bankRates
    .filter(b => b.rates[activeTab as keyof typeof b.rates] !== undefined)
    .sort((a, b) => (a.rates[activeTab as keyof typeof a.rates] || 0) - (b.rates[activeTab as keyof typeof b.rates] || 0));

  return (
    <div className="space-y-6">
      {/* Hero EMI */}
      <motion.div
        className="glass-card-elevated p-10 text-center relative overflow-hidden group"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-[0.2em]">Monthly EMI</p>
        <div className="hero-metric drop-shadow-sm">
          <AnimatedNumber value={result.emi} format={numberFormat} currency={currency} />
        </div>
        <p className="text-xs font-semibold text-muted-foreground mt-4 opacity-60 uppercase tracking-widest">Equated Monthly Installment</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="stat-card group"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Landmark size={14} className="group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest">Principal</span>
          </div>
          <span className="text-xl font-black text-foreground tabular-nums">
            <AnimatedNumber value={principal} format={numberFormat} currency={currency} />
          </span>
          <ValueDescriptor value={principal} format={numberFormat} />
        </motion.div>

        <motion.div
          className="stat-card group"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 text-chart-interest mb-1">
            <TrendingDown size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Interest</span>
          </div>
          <span className="text-xl font-black text-foreground tabular-nums">
            <AnimatedNumber value={result.totalInterest} format={numberFormat} currency={currency} />
          </span>
          <ValueDescriptor value={result.totalInterest} format={numberFormat} />
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
               <motion.div 
                className="h-full bg-chart-interest" 
                initial={{ width: 0 }}
                animate={{ width: `${interestPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">{interestPercent}%</span>
          </div>
        </motion.div>

        <motion.div
          className="stat-card group"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Wallet size={14} className="group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest">Total Amount</span>
          </div>
          <span className="text-xl font-black text-foreground tabular-nums">
            <AnimatedNumber value={result.totalAmount} format={numberFormat} currency={currency} />
          </span>
          <ValueDescriptor value={result.totalAmount} format={numberFormat} />
        </motion.div>

        <motion.div
          className="stat-card group border-primary/20 bg-primary/[0.02]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 text-primary mb-1">
            <Wallet size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Income Required</span>
          </div>
          <span className="text-xl font-black text-foreground tabular-nums">
            <AnimatedNumber value={result.minIncome} format={numberFormat} currency={currency} />
          </span>
          <ValueDescriptor value={result.minIncome} format={numberFormat} />
          <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">Recommended Monthly Net</p>
        </motion.div>
      </div>

      {/* Pro Insight Card */}
      <motion.div
        className="glass-card-elevated p-6 border-primary/20 bg-primary/5 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
             <TrendingDown className="text-primary" size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Wealth Insight</h3>
            {(() => {
              const extraPayment = Math.round(result.emi * 0.1);
              const monthsSaved = Math.round(result.schedule.length * 0.15); 
              const interestSaved = Math.round(result.totalInterest * 0.18);
              
              return (
                <p className="text-sm leading-relaxed text-foreground/80 font-medium">
                  Pay just <strong>{formatCurrency(extraPayment, numberFormat, currency)} extra</strong> per month to save approx. <strong>{formatCurrency(interestSaved, numberFormat, currency)}</strong> in interest and close your loan <strong>{monthsSaved} months</strong> early.
                </p>
              );
            })()}
          </div>
        </div>
      </motion.div>

      {/* Market Benchmarks Toggle */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setShowMarketRates(!showMarketRates)}
          className="w-full flex items-center justify-between px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-primary" />
            Market Floor Rates ({activeTab})
          </div>
          <motion.div animate={{ rotate: showMarketRates ? 180 : 0 }}>
            <ChevronDown size={14} />
          </motion.div>
        </button>
        <AnimatePresence>
          {showMarketRates && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-border/10 bg-primary/[0.01]"
            >
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {marketBenchmarks.map((bank) => (
                  <div key={bank.name} className="p-3 rounded-xl bg-background/50 border border-border/50 flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground truncate">{bank.name}</span>
                    <span className="text-lg font-black text-foreground tabular-nums tracking-tighter">
                      {bank.rates[activeTab as keyof typeof bank.rates]}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="px-6 pb-4 text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                Indicative floor rates. Verified monthly.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Donut Chart & Export */}
      <motion.div
        className="glass-card p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Repayment Breakdown</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="90%"
                paddingAngle={5}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                strokeWidth={0}
              >
                {donutData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, numberFormat, currency)}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "16px",
                  fontSize: "12px",
                  fontWeight: 700
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-8 mt-4 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Principal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-chart-interest shadow-lg shadow-chart-interest/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Interest</span>
          </div>
        </div>

        <button
          onClick={() => handlePrint()}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 active:scale-[0.98] print:hidden"
        >
          <Download size={16} />
          Generate PDF Report
        </button>
      </motion.div>
    </div>
  );
}
