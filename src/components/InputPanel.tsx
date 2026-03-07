import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Home, Car, GraduationCap, User, Briefcase, Coins, Building, Bike, CreditCard } from "lucide-react";
import { useState } from "react";
import type { LoanInput, NumberFormat, LoanTypeConfig, Currency } from "@/lib/loanCalculations";
import { loanTypes, currencies } from "@/lib/loanCalculations";

const tabIcons: Record<string, React.ReactNode> = {
  home: <Home size={18} />,
  car: <Car size={18} />,
  bike: <Bike size={18} />,
  personal: <User size={18} />,
  business: <Briefcase size={18} />,
  gold: <Coins size={18} />,
  property: <Building size={18} />,
  education: <GraduationCap size={18} />,
  credit: <CreditCard size={18} />,
};

interface InputPanelProps {
  loanInput: LoanInput;
  onChange: (input: LoanInput) => void;
  numberFormat: NumberFormat;
  currency: Currency;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  suffix,
  prefix,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
        <span className="text-sm font-black text-foreground tabular-nums">
          {prefix}{displayValue}{suffix}
        </span>
      </div>
      <div className="relative">
        <input
          type="text"
          value={prefix ? `${prefix}${displayValue}` : displayValue}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, "");
            const num = parseFloat(raw);
            if (!isNaN(num) && num >= min && num <= max) onChange(num);
          }}
          className="premium-input font-mono"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="premium-slider"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((value - min) / (max - min)) * 100}%, hsl(var(--secondary)) ${((value - min) / (max - min)) * 100}%, hsl(var(--secondary)) 100%)`,
        }}
      />
      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
        <span>{prefix}{formatValue ? formatValue(min) : min}{suffix}</span>
        <span>{prefix}{formatValue ? formatValue(max) : max}{suffix}</span>
      </div>
    </div>
  );
}

export default function InputPanel({ 
  loanInput, 
  onChange, 
  numberFormat, 
  currency,
  activeTab, 
  onTabChange 
}: InputPanelProps) {
  const [tenureInYears, setTenureInYears] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const config = loanTypes[activeTab];
  const currencySymbol = currencies[currency].symbol;

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    const c = loanTypes[tab];
    onChange({
      principal: c.defaultPrincipal,
      annualRate: c.defaultRate,
      tenureMonths: c.defaultTenure,
      prepayment: 0,
      prepaymentType: "yearly",
    });
  };

  const formatAmount = (v: number) => {
    if (numberFormat === "indian") {
      if (v >= 10000000) return `${(v / 10000000).toFixed(1)} Cr`;
      if (v >= 100000) return `${(v / 100000).toFixed(1)} L`;
      return new Intl.NumberFormat("en-IN").format(v);
    }
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Category Selector */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-secondary/30 rounded-3xl">
        {Object.entries(loanTypes).map(([key, lt]) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`relative p-3 rounded-2xl transition-all duration-300 group ${
              activeTab === key ? "text-primary-foreground" : "hover:bg-secondary/50 text-muted-foreground"
            }`}
          >
            {activeTab === key && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-2xl shadow-xl shadow-primary/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <span className={`transition-transform duration-300 ${activeTab === key ? "scale-110" : "group-hover:scale-110"}`}>
                {tabIcons[key]}
              </span>
              <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">
                {lt.label.replace(" Loan", "")}
              </span>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <SliderInput
            label="Loan Amount"
            value={loanInput.principal}
            min={100000}
            max={config.maxPrincipal}
            step={50000}
            prefix={currencySymbol}
            onChange={(v) => onChange({ ...loanInput, principal: v })}
            formatValue={formatAmount}
          />

          <SliderInput
            label="Interest Rate"
            value={loanInput.annualRate}
            min={1}
            max={30}
            step={0.05}
            suffix="%"
            onChange={(v) => onChange({ ...loanInput, annualRate: v })}
            formatValue={(v) => v.toFixed(2)}
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tenure in</span>
              <div className="flex bg-secondary/50 rounded-xl p-0.5">
                <button
                  onClick={() => setTenureInYears(true)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    tenureInYears ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"
                  }`}
                >
                  Years
                </button>
                <button
                  onClick={() => setTenureInYears(false)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    !tenureInYears ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground"
                  }`}
                >
                  Months
                </button>
              </div>
            </div>
            <SliderInput
              label="Loan Tenure"
              value={tenureInYears ? loanInput.tenureMonths / 12 : loanInput.tenureMonths}
              min={tenureInYears ? 1 : 6}
              max={tenureInYears ? config.maxTenure / 12 : config.maxTenure}
              step={tenureInYears ? 1 : 1}
              suffix={tenureInYears ? " yrs" : " mo"}
              onChange={(v) =>
                onChange({ ...loanInput, tenureMonths: tenureInYears ? v * 12 : v })
              }
              formatValue={(v) => v.toString()}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Advanced */}
      <div className="border border-border/50 rounded-3xl overflow-hidden glass-card">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Advanced Strategy
          <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }} transition={{ duration: 0.4, ease: "backOut" }}>
            <ChevronDown size={16} />
          </motion.div>
        </button>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-6">
                <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl">
                  <button
                    onClick={() => onChange({ ...loanInput, prepaymentType: "yearly" })}
                    className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      loanInput.prepaymentType === "yearly"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => onChange({ ...loanInput, prepaymentType: "onetime" })}
                    className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      loanInput.prepaymentType === "onetime"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    One-time
                  </button>
                </div>
                <SliderInput
                  label="Pre-payment Amount"
                  value={loanInput.prepayment}
                  min={0}
                  max={loanInput.principal * 0.5}
                  step={10000}
                  prefix={currencySymbol}
                  onChange={(v) => onChange({ ...loanInput, prepayment: v })}
                  formatValue={formatAmount}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
