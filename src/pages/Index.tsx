import { useState, useMemo, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Globe, Github, Linkedin, X, Heart, Shield, Zap } from "lucide-react";
import Header, { Logo } from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import ResultsPanel from "@/components/ResultsPanel";
import AmortizationSchedule from "@/components/AmortizationSchedule";
import { calculateEMI, loanTypes, formatCurrency } from "@/lib/loanCalculations";
import type { LoanInput, NumberFormat, Currency } from "@/lib/loanCalculations";

const Index = () => {
  const [numberFormat, setNumberFormat] = useState<NumberFormat>("indian");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [activeTab, setActiveTab] = useState("home");
  const [time, setTime] = useState(new Date());
  const [showStory, setShowStory] = useState(false);
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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state with URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get("amount");
    const rate = params.get("rate");
    const tenure = params.get("tenure");
    const type = params.get("type");
    const format = params.get("format") as NumberFormat;
    const curr = params.get("currency") as Currency;

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

    if (curr) {
      setCurrency(curr);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("amount", loanInput.principal.toString());
    params.set("rate", loanInput.annualRate.toString());
    params.set("tenure", loanInput.tenureMonths.toString());
    params.set("type", activeTab);
    params.set("format", numberFormat);
    params.set("currency", currency);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  }, [loanInput, activeTab, numberFormat, currency]);

  const result = useMemo(() => calculateEMI(loanInput), [loanInput]);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Top Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] px-6 py-2 flex justify-between items-center pointer-events-none no-print">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-primary/60"
        >
          {time.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 tabular-nums"
        >
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
        </motion.div>
      </div>

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-screen w-full pointer-events-none z-0 overflow-hidden no-print">
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

      <div className="no-print">
        <Header 
          numberFormat={numberFormat} 
          onFormatChange={setNumberFormat}
          currency={currency}
          onCurrencyChange={setCurrency}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-40 sm:pb-20 relative z-10" ref={componentRef}>
        
        {/* Professional Print Header */}
        <div className="hidden print:flex flex-col gap-6 mb-12 border-b-2 border-primary/20 pb-8">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-xl">E</span>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">EMIQ</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Quotient v2.0</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loan Strategy Report</p>
              <p className="text-sm font-bold text-foreground">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Hero - Screen only */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12 sm:mb-32 no-print"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 sm:mb-12"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Intelligence Quotient v2.0
          </motion.div>

          <div className="flex flex-col items-center justify-center">
            <h1 className="text-5xl sm:text-8xl lg:text-9xl font-black tracking-tighter text-foreground leading-[0.9] mb-6 sm:mb-8 flex items-baseline">
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
              className="flex items-center gap-3 sm:gap-4 mb-8"
            >
              <div className="h-px w-4 sm:w-8 bg-border" />
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-muted-foreground whitespace-nowrap">
                Equated Monthly <span className="text-foreground">Intelligence</span>
              </p>
              <div className="h-px w-4 sm:w-8 bg-border" />
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-muted-foreground font-medium text-base sm:text-2xl max-w-3xl mx-auto print:hidden leading-relaxed tracking-tight px-4"
          >
            The definitive global tool for <span className="text-foreground font-bold italic tracking-tighter text-primary"> intelligent &nbsp;</span> loan planning and market benchmarking.
          </motion.p>

          {/* Trust Architecture Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col items-center gap-8 mt-16 sm:mt-24 px-4 no-print"
          >
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
              {[
                { label: "Zero Ads", icon: "✨" },
                { label: "Zero Tracking", icon: "🛡️" },
                { label: "No Login", icon: "⚡" },
                { label: "Always Free", icon: "💎" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 group cursor-default">
                  <span className="text-base sm:text-lg group-hover:scale-120 transition-transform duration-500">{item.icon}</span>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-primary transition-colors duration-500">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStory(true)}
              className="px-6 py-2.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-all"
            >
              Why I built this website
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Story Modal */}
        <AnimatePresence>
          {showStory && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowStory(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl glass-card-elevated p-8 sm:p-12 overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => setShowStory(false)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground text-center sm:text-left">The Inception of <span className="text-primary">EMIQ</span></h2>
                    <div className="h-1 w-12 bg-primary rounded-full mx-auto sm:mx-0" />
                  </div>

                  <div className="space-y-6 text-muted-foreground leading-relaxed text-base sm:text-lg">
                    <p>
                      The internet is flooded with loan calculators, but almost all of them share the same DNA: they are designed to sell you something. Whether it's aggressive ads, intrusive tracking, or mandatory logins to "save" your data, the focus is never on the user's financial clarity.
                    </p>
                    
                    <p>
                      I built <strong>EMIQ</strong> because I needed a tool that was fast, precise, and most importantly, <span className="text-foreground font-bold">private</span>. I wanted an interface that didn't feel like a spreadsheet, but like a high-end financial instrument—where the math is transparent and the insights are strategic.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Shield size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">Privacy First</span>
                        </div>
                        <p className="text-xs font-semibold">Your data never leaves your device. 100% client-side calculation.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                          <Zap size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">Always Utility</span>
                        </div>
                        <p className="text-xs font-semibold">No ads, no leads, no spam. Just pure financial intelligence.</p>
                      </div>
                    </div>

                    <p>
                      This project is my contribution to the open financial web. I plan to keep <strong>EMIQ</strong> free, ad-free, and open-source forever. It will remain a clean utility for anyone from first-time homebuyers to global investors who values their time and financial sanity.
                    </p>
                  </div>

                  <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Heart size={20} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Created by</p>
                        <p className="text-sm font-bold text-foreground">Hariharen</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <a href="https://github.com/hariharen9" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Github size={20} /></a>
                      <a href="https://linkedin.com/in/hariharen9" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={20} /></a>
                      <a href="https://hariharen.site" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Globe size={20} /></a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Calculator Grid */}
        <motion.div 
          className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-24 w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full lg:w-[40%] no-print shrink-0">
            <div className="sticky top-28 w-full">
              <InputPanel
                loanInput={loanInput}
                onChange={setLoanInput}
                numberFormat={numberFormat}
                currency={currency}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
          
          {/* Professional Print Summary */}
          <div className="hidden print:block w-full mb-12">
            <h2 className="section-title !mt-0 !mb-6 text-primary uppercase">Configuration Summary</h2>
            <div className="grid grid-cols-2 gap-y-8 gap-x-12 border-2 border-primary/5 p-8 rounded-[2rem] bg-primary/[0.01]">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Loan Category</p>
                <p className="text-2xl font-black text-foreground capitalize">{activeTab} Loan</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Principal Amount</p>
                <p className="text-2xl font-black text-foreground tabular-nums">{formatCurrency(loanInput.principal, numberFormat, currency)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Interest Rate</p>
                <p className="text-2xl font-black text-foreground tabular-nums">{loanInput.annualRate}%</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Repayment Tenure</p>
                <p className="text-2xl font-black text-foreground tabular-nums">{loanInput.tenureMonths / 12} Years <span className="text-sm font-bold text-muted-foreground opacity-50">({loanInput.tenureMonths} Mo)</span></p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[60%] flex-grow min-w-0">
            <ResultsPanel
              result={result}
              principal={loanInput.principal}
              numberFormat={numberFormat}
              currency={currency}
              activeTab={activeTab}
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
          <AmortizationSchedule 
            schedule={result.schedule} 
            numberFormat={numberFormat} 
            currency={currency}
          />
        </motion.div>

        {/* Footer */}
        <footer className="pt-20 pb-12 border-t border-border/20 no-print">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 px-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-xl font-black tracking-tighter text-foreground">
                EMI<span className="text-primary">Q</span>
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                Intelligent Planning Engine
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-6">
                <a 
                  href="https://hariharen.site" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  title="Website"
                >
                  <Globe size={20} />
                </a>
                <a 
                  href="https://github.com/hariharen9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  title="GitHub"
                >
                  <Github size={20} />
                </a>
                <a 
                  href="https://linkedin.com/in/hariharen9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  title="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                Crafted by <a href="https://hariharen.site" className="text-foreground hover:text-primary transition-colors">Hariharen</a>
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                <a 
                  href="https://github.com/hariharen9/emiq/blob/main/LICENSE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  MIT License
                </a> • © 2026
              </p>
              <div className="h-1 w-12 bg-primary/20 rounded-full" />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;