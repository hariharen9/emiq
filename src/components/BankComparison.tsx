import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Landmark } from "lucide-react";
import { bankRates, calculateEMI, formatCurrency } from "@/lib/loanCalculations";
import type { BankRate, NumberFormat, Currency } from "@/lib/loanCalculations";

interface BankComparisonProps {
  numberFormat: NumberFormat;
  currency: Currency;
}

export default function BankComparison({ numberFormat, currency }: BankComparisonProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BankRate[]>([]);

  const filtered = useMemo(
    () => bankRates.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const toggleBank = (bank: BankRate) => {
    setSelected((prev) => {
      const exists = prev.find((b) => b.name === bank.name);
      if (exists) return prev.filter((b) => b.name !== bank.name);
      if (prev.length >= 2) return [prev[1], bank];
      return [...prev, bank];
    });
  };

  const comparisonPrincipal = currency === "INR" ? 5000000 : 100000;
  const comparisonTenure = 240;

  const comparisons = useMemo(() => {
    return selected.map((bank) => {
      const result = calculateEMI({
        principal: comparisonPrincipal,
        annualRate: bank.rate,
        tenureMonths: comparisonTenure,
        prepayment: 0,
        prepaymentType: "yearly",
      });
      return { bank, result };
    });
  }, [selected, comparisonPrincipal]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <h2 className="section-title !mb-0">Bank Intelligence</h2>
        
        {/* Search */}
        <div className="relative min-w-[300px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Filter by bank name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="premium-input !py-3 !px-12 !text-base"
          />
        </div>
      </div>

      {/* Bank Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((bank, i) => {
          const isSelected = selected.some((b) => b.name === bank.name);
          return (
            <motion.button
              key={bank.name}
              onClick={() => toggleBank(bank)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`glass-card p-5 text-left transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${
                isSelected ? "ring-2 ring-primary bg-primary/[0.03] border-primary/30 shadow-2xl shadow-primary/10" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-foreground text-[10px] uppercase tracking-[0.2em]">{bank.name}</span>
                <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg ${
                  bank.country === "IN" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                }`}>
                  {bank.country === "IN" ? "IN" : "GL"}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{bank.rate}%</span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{bank.type}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Comparison */}
      {comparisons.length === 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-elevated p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             <Landmark size={200} />
          </div>
          
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-3">
              Market Analysis
            </p>
            <p className="text-sm font-bold text-muted-foreground mb-12">
              Competitive benchmark for {formatCurrency(comparisonPrincipal, numberFormat, currency)} loan over {comparisonTenure / 12} years
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 mb-12">
              {comparisons.map(({ bank, result }) => (
                <div key={bank.name} className="space-y-8">
                  <div>
                    <p className="text-2xl font-black text-foreground tracking-tighter">{bank.name}</p>
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{bank.rate}% {bank.type}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly EMI</p>
                    <p className="text-4xl font-black text-foreground tabular-nums tracking-tighter">{formatCurrency(result.emi, numberFormat, currency)}</p>
                  </div>
                  
                  <div className="pt-6 border-t border-border/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Interest</p>
                      <p className="text-base font-black text-chart-interest tabular-nums tracking-tighter">{formatCurrency(result.totalInterest, numberFormat, currency)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Repayment</p>
                      <p className="text-base font-black text-foreground tabular-nums tracking-tighter">{formatCurrency(result.totalAmount, numberFormat, currency)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Savings Analysis */}
            {(() => {
              const diff = Math.abs(comparisons[0].result.totalInterest - comparisons[1].result.totalInterest);
              const cheaper = comparisons[0].result.totalInterest < comparisons[1].result.totalInterest
                ? comparisons[0].bank.name
                : comparisons[1].bank.name;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[2rem] bg-primary/[0.03] border border-primary/10 flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <ArrowRight size={32} className="text-primary" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-black text-foreground tracking-tight mb-1">
                      Financial Advantage: {cheaper}
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                      By opting for {cheaper}, you will reduce your interest obligation by <strong className="text-primary font-black">{formatCurrency(diff, numberFormat, currency)}</strong>. This surplus capital could be reinvested to further accelerate your wealth creation.
                    </p>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </motion.div>
      )}

      {selected.length > 0 && selected.length < 2 && (
        <p className="text-xs font-bold text-primary/60 text-center animate-pulse uppercase tracking-[0.2em]">Select one more institution for head-to-head analysis</p>
      )}
    </motion.div>
  );
}
