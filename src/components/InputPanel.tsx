import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Home, Car, GraduationCap, User, Briefcase, Coins, Building, Bike, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import type { LoanInput, NumberFormat, LoanTypeConfig, Currency } from "@/lib/loanCalculations";
import { loanTypes, formatCurrency, currencies } from "@/lib/loanCalculations";

const tabIcons: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
  car: <Car className="w-4 h-4 sm:w-5 sm:h-5" />,
  bike: <Bike className="w-4 h-4 sm:w-5 sm:h-5" />,
  personal: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
  business: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />,
  gold: <Coins className="w-4 h-4 sm:w-5 sm:h-5" />,
  property: <Building className="w-4 h-4 sm:w-5 sm:h-5" />,
  education: <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />,
  credit: <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />,
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
  const [inputValue, setInputValue] = useState(value.toString());
  const displayValue = formatValue ? formatValue(value) : value.toString();

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setInputValue(raw);
    const num = parseFloat(raw);
    if (!isNaN(num)) onChange(num);
  };

  const handleBlur = () => {
    let num = parseFloat(inputValue);
    if (isNaN(num)) num = min;
    const clamped = Math.max(min, Math.min(max, num));
    onChange(clamped);
    setInputValue(clamped.toString());
  };

  return (
    <motion.div 
      className="space-y-3 group/slider w-full"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">{label}</label>
        <motion.span 
          key={displayValue}
          initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
          className="text-xs font-black text-primary tabular-nums shrink-0"
        >
          {prefix}{displayValue}{suffix}
        </motion.span>
      </div>
      
      <div className="relative w-full">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-base opacity-30 pointer-events-none">
          {prefix}
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="premium-input !py-3 !pl-10 !pr-12 font-mono text-base w-full"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xs opacity-30 pointer-events-none">
          {suffix}
        </div>
      </div>

      <div className="relative pt-2 pb-1 w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChange(val);
            setInputValue(val.toString());
          }}
          className="premium-slider w-full"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((value - min) / (max - min)) * 100}%, hsl(var(--secondary)) ${((value - min) / (max - min)) * 100}%, hsl(var(--secondary)) 100%)`,
          }}
        />
      </div>
      
      <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-tighter opacity-40">
        <span className="truncate mr-2">{prefix}{formatValue ? formatValue(min) : min}{suffix}</span>
        <span className="truncate ml-2">{prefix}{formatValue ? formatValue(max) : max}{suffix}</span>
      </div>
    </motion.div>
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
    <div className="flex flex-col gap-6 sm:gap-10 w-full overflow-hidden">
      {/* Category Selector - Horizontal Scroll on Mobile */}
      <div className="w-full">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 ml-1 sm:hidden">Select Category</p>
        <div className="flex sm:grid sm:grid-cols-3 gap-2 overflow-x-auto pb-4 sm:pb-0 scrollbar-none no-scrollbar snap-x snap-mandatory p-1">
          {Object.entries(loanTypes).map(([key, lt]) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`relative flex-shrink-0 w-24 sm:w-auto py-3 px-2 rounded-2xl transition-all duration-500 group snap-center ${
                activeTab === key ? "text-primary-foreground" : "bg-secondary/20 text-muted-foreground hover:bg-secondary/40"
              }`}
            >
              {activeTab === key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <span className={`transition-transform duration-500 ${activeTab === key ? "scale-110" : "group-hover:scale-110"}`}>
                  {tabIcons[key]}
                </span>
                <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">
                  {lt.label.replace(" Loan", "")}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8 w-full"
        >
          <SliderInput
            label="Principal Amount"
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

          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tenure Type</span>
              <div className="flex bg-secondary/30 rounded-xl p-1">
                <button
                  onClick={() => setTenureInYears(true)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    tenureInYears ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground"
                  }`}
                >
                  Years
                </button>
                <button
                  onClick={() => setTenureInYears(false)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    !tenureInYears ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground"
                  }`}
                >
                  Months
                </button>
              </div>
            </div>
            <SliderInput
              label="Loan Duration"
              value={tenureInYears ? loanInput.tenureMonths / 12 : loanInput.tenureMonths}
              min={tenureInYears ? 1 : 6}
              max={tenureInYears ? config.maxTenure / 12 : config.maxTenure}
              step={1}
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
      <div className="glass-card overflow-hidden w-full">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          Extra Strategy
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
              className="overflow-hidden border-t border-border/10"
            >
              <div className="p-6 space-y-8 w-full">
                <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl">
                  <button
                    onClick={() => onChange({ ...loanInput, prepaymentType: "yearly" })}
                    className={`flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      loanInput.prepaymentType === "yearly"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => onChange({ ...loanInput, prepaymentType: "onetime" })}
                    className={`flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      loanInput.prepaymentType === "onetime"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
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
