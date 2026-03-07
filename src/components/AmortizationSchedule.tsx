import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AmortizationRow, NumberFormat } from "@/lib/loanCalculations";
import { formatCurrency } from "@/lib/loanCalculations";

interface AmortizationScheduleProps {
  schedule: AmortizationRow[];
  numberFormat: NumberFormat;
}

export default function AmortizationSchedule({ schedule, numberFormat }: AmortizationScheduleProps) {
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const [page, setPage] = useState(0);
  const perPage = 12;

  const yearlyData = useMemo(() => {
    const years: Record<number, { year: number; principal: number; interest: number; balance: number }> = {};
    schedule.forEach((row) => {
      if (!years[row.year]) {
        years[row.year] = { year: row.year, principal: 0, interest: 0, balance: row.closingBalance };
      }
      years[row.year].principal += row.principalPaid + row.prepaymentPaid;
      years[row.year].interest += row.interestPaid;
      years[row.year].balance = row.closingBalance;
    });
    return Object.values(years);
  }, [schedule]);

  const chartData = useMemo(() => {
    return yearlyData.map((y) => ({
      name: `Yr ${y.year}`,
      Balance: Math.round(y.balance),
      Principal: Math.round(y.principal),
      Interest: Math.round(y.interest),
    }));
  }, [yearlyData]);

  const tableData = viewMode === "yearly" ? yearlyData : schedule;
  const totalPages = Math.ceil(tableData.length / perPage);
  const pagedData = tableData.slice(page * perPage, (page + 1) * perPage);

  if (schedule.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      <h2 className="section-title">Amortization Schedule</h2>

      {/* Balance Chart */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Principal & Interest Projection</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Balance</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border) / 0.5)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} 
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} 
                tickFormatter={(v) => {
                  if (numberFormat === "indian") {
                    if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
                    if (v >= 100000) return `${(v / 100000).toFixed(0)}L`;
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                    return v;
                  }
                  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                  return v;
                }} 
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary) / 0.2)', strokeWidth: 2 }}
                formatter={(value: number) => formatCurrency(value, numberFormat)}
                contentStyle={{
                  background: "hsl(var(--card))",
                  backdropFilter: "blur(20px)",
                  border: "1px solid hsl(var(--border) / 0.5)",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.1)"
                }}
              />
              <Area
                type="monotone"
                dataKey="Balance"
                stroke="hsl(var(--primary))"
                fill="url(#balanceGrad)"
                strokeWidth={4}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border/20 bg-primary/[0.02]">
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Detailed Breakdown</p>
          <div className="flex bg-secondary/50 rounded-xl p-0.5">
            <button
              onClick={() => { setViewMode("yearly"); setPage(0); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => { setViewMode("monthly"); setPage(0); }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  {viewMode === "yearly" ? "Year" : "Month"}
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Principal</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Interest</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Balance</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((row: any, i: number) => (
                <tr key={i} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-foreground">
                    {viewMode === "yearly" ? row.year : row.month}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {formatCurrency(
                      viewMode === "yearly" ? row.principal : row.principalPaid + (row.prepaymentPaid || 0),
                      numberFormat
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-chart-interest">
                    {formatCurrency(
                      viewMode === "yearly" ? row.interest : row.interestPaid,
                      numberFormat
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {formatCurrency(
                      viewMode === "yearly" ? row.balance : row.closingBalance,
                      numberFormat
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/50">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-secondary/80 transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-secondary/80 transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
