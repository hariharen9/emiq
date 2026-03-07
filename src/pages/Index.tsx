import { useState, useMemo, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Header, { Logo } from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import ResultsPanel from "@/components/ResultsPanel";
import AmortizationSchedule from "@/components/AmortizationSchedule";
import BankComparison from "@/components/BankComparison";
import { calculateEMI, loanTypes, formatCurrency } from "@/lib/loanCalculations";
import type { LoanInput, NumberFormat } from "@/lib/loanCalculations";

const Index = () => {
  const [numberFormat, setNumberFormat] = useState<NumberFormat>("indian");
  const [activeTab, setActiveTab] = useState("home");
  const [loanInput, setLoanInput] = useState<LoanInput>({
    principal: loanTypes.home.defaultPrincipal,
    annualRate: loanTypes.home.defaultRate,
    tenureMonths: loanTypes.home.defaultTenure,
    prepayment: 0,
    prepaymentType: "yearly",
  });
  const componentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Sync state with URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get("amount");
    const rate = params.get("rate");
    const tenure = params.get("tenure");
    const type = params.get("type");
    const format = params.get("format") as NumberFormat;

    if (type && loanTypes[type]) {
      setActiveTab(type);
    }

    if (amount || rate || tenure) {
      setLoanInput(prev => ({
        ...prev,
        principal: amount ? parseFloat(amount) : prev.principal,
        annualRate: rate ? parseFloat(rate) : prev.annualRate,
        tenureMonths: tenure ? parseInt(tenure) : prev.tenureMonths,
      }));
    }

    if (format === "indian" || format === "western") {
      setNumberFormat(format);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("amount", loanInput.principal.toString());
    params.set("rate", loanInput.annualRate.toString());
    params.set("tenure", loanInput.tenureMonths.toString());
    params.set("type", activeTab);
    params.set("format", numberFormat);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [loanInput, activeTab, numberFormat]);

  const result = useMemo(() => calculateEMI(loanInput), [loanInput]);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-screen w-full pointer-events-none z-0 overflow-hidden">
        <motion.div 
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
            x: [0, 50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-chart-interest/10 blur-[120px]"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
            y: [0, -50, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <Header numberFormat={numberFormat} onFormatChange={setNumberFormat} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10" ref={componentRef}>
        {/* Hero */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 sm:mb-32"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-12"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Intelligence Quotient v2.0
          </motion.div>

          <div className="flex flex-col items-center justify-center">
            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter text-foreground leading-[0.8] mb-8 flex items-baseline">
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                EMI
              </motion.span>
              <motion.span
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="text-primary relative inline-block"
              >
                Q
                <motion.div 
                  className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/20 blur-xl"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </motion.span>
            </h1>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-px w-8 bg-border" />
              <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">
                Equated Monthly <span className="text-foreground">Intelligence</span>
              </p>
              <div className="h-px w-8 bg-border" />
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-muted-foreground font-medium text-lg sm:text-2xl max-w-3xl mx-auto print:hidden leading-relaxed tracking-tight"
          >
            The definitive global tool for <span className="text-foreground font-bold italic">intelligent</span> loan planning and market benchmarking.
          </motion.p>
        </motion.div>

        {/* Calculator Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lg:col-span-5 print:hidden">
            <div className="sticky top-28">
              <InputPanel
                loanInput={loanInput}
                onChange={setLoanInput}
                numberFormat={numberFormat}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
          
          {/* Print only summary of inputs */}
          <div className="hidden print:block col-span-12 mb-8">
            <div className="glass-card p-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Loan Amount</p>
                <p className="text-xl font-bold">{formatCurrency(loanInput.principal, numberFormat)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Interest Rate</p>
                <p className="text-xl font-bold">{loanInput.annualRate}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Tenure</p>
                <p className="text-xl font-bold">{loanInput.tenureMonths / 12} Years</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 col-span-12">
            <ResultsPanel
              result={result}
              principal={loanInput.principal}
              numberFormat={numberFormat}
              printRef={componentRef}
            />
          </div>
        </motion.div>

        {/* Amortization */}
        <motion.div 
          className="mb-24"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <AmortizationSchedule schedule={result.schedule} numberFormat={numberFormat} />
        </motion.div>

        {/* Bank Comparison */}
        <motion.div 
          className="mb-24 print:hidden"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <BankComparison numberFormat={numberFormat} />
        </motion.div>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-border/20">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">
            EMIQ Intelligent Planning Engine
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;