import { motion, useSpring, useTransform, animate } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Download, TrendingDown, Wallet, Landmark } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import type { EMIResult, NumberFormat } from "@/lib/loanCalculations";
import { formatCurrency } from "@/lib/loanCalculations";

interface ResultsPanelProps {
  result: EMIResult;
  principal: number;
  numberFormat: NumberFormat;
  printRef: React.RefObject<HTMLDivElement>;
}

function AnimatedNumber({ value, format }: { value: number; format: NumberFormat }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value]);

  return <>{formatCurrency(displayValue, format)}</>;
}

const COLORS = ["hsl(172, 66%, 40%)", "hsl(340, 65%, 55%)"];

export default function ResultsPanel({ result, principal, numberFormat, printRef }: ResultsPanelProps) {
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Loan_Summary_EMIQ",
  });

  const donutData = [
    { name: "Principal", value: principal },
    { name: "Interest", value: result.totalInterest },
  ];

  const interestPercent = principal > 0 ? ((result.totalInterest / result.totalAmount) * 100).toFixed(1) : "0";

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
          <AnimatedNumber value={result.emi} format={numberFormat} />
        </div>
        <p className="text-xs font-semibold text-muted-foreground mt-4 opacity-60">Calculated for your specific tenure</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <span className="text-2xl font-black text-foreground tabular-nums">
            <AnimatedNumber value={principal} format={numberFormat} />
          </span>
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
          <span className="text-2xl font-black text-foreground tabular-nums">
            <AnimatedNumber value={result.totalInterest} format={numberFormat} />
          </span>
          <div className="flex items-center gap-1.5 mt-1">
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
          <span className="text-2xl font-black text-foreground tabular-nums">
            <AnimatedNumber value={result.totalAmount} format={numberFormat} />
          </span>
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
              const monthsSaved = Math.round(result.schedule.length * 0.15); // Rough heuristic for 10% extra
              const interestSaved = Math.round(result.totalInterest * 0.18);
              
              return (
                <p className="text-sm leading-relaxed text-foreground/80">
                  Pay just <strong>{formatCurrency(extraPayment, numberFormat)} extra</strong> per month to save approx. <strong>{formatCurrency(interestSaved, numberFormat)}</strong> in interest and close your loan <strong>{monthsSaved} months</strong> early.
                </p>
              );
            })()}
          </div>
        </div>
      </motion.div>

      {/* Donut Chart */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">Principal vs Interest</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                strokeWidth={0}
              >
                {donutData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, numberFormat)}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[0] }} />
            <span className="text-xs text-muted-foreground">Principal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[1] }} />
            <span className="text-xs text-muted-foreground">Interest</span>
          </div>
        </div>

        {/* Export */}
        <button
          onClick={() => handlePrint()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 print:hidden"
        >
          <Download size={16} />
          Export as PDF
        </button>
      </motion.div>
    </div>
  );
}
