export interface LoanInput {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  prepayment: number;
  prepaymentType: "yearly" | "onetime";
}

export interface EMIResult {
  emi: number;
  totalInterest: number;
  totalAmount: number;
  schedule: AmortizationRow[];
  minIncome: number;
}

export interface AmortizationRow {
  month: number;
  year: number;
  openingBalance: number;
  emiPaid: number;
  principalPaid: number;
  interestPaid: number;
  prepaymentPaid: number;
  closingBalance: number;
}

export function calculateEMI(input: LoanInput): EMIResult {
  const { principal, annualRate, tenureMonths, prepayment, prepaymentType } = input;

  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) {
    return { emi: 0, totalInterest: 0, totalAmount: 0, schedule: [], minIncome: 0 };
  }

  const monthlyRate = annualRate / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let m = 1; m <= tenureMonths && balance > 0; m++) {
    const interest = balance * monthlyRate;
    let principalPart = emi - interest;
    let prepaymentAmount = 0;

    if (prepaymentType === "yearly" && m % 12 === 0 && prepayment > 0) {
      prepaymentAmount = Math.min(prepayment, balance - principalPart);
    } else if (prepaymentType === "onetime" && m === 12 && prepayment > 0) {
      prepaymentAmount = Math.min(prepayment, balance - principalPart);
    }

    if (principalPart > balance) principalPart = balance;
    const closingBalance = Math.max(0, balance - principalPart - prepaymentAmount);

    totalInterest += interest;
    totalPrincipal += principalPart + prepaymentAmount;

    schedule.push({
      month: m,
      year: Math.ceil(m / 12),
      openingBalance: balance,
      emiPaid: Math.min(emi, balance + interest),
      principalPaid: principalPart,
      interestPaid: interest,
      prepaymentPaid: prepaymentAmount,
      closingBalance,
    });

    balance = closingBalance;
  }

  return {
    emi: Math.round(emi * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalAmount: Math.round((principal + totalInterest) * 100) / 100,
    schedule,
    minIncome: Math.round((emi / 0.4) * 100) / 100, // 40% EMI-to-income heuristic
  };
}

export interface BankRate {
  name: string;
  country: "IN" | "GLOBAL";
  rates: {
    home?: number;
    car?: number;
    personal?: number;
    business?: number;
    gold?: number;
    education?: number;
    bike?: number;
    property?: number;
    credit?: number;
  };
  type: string;
  lastUpdated: string;
}

export const bankRates: BankRate[] = [
  {
    name: "SBI",
    country: "IN",
    type: "EBLR",
    lastUpdated: "2026-03-01",
    rates: { home: 8.4, car: 8.7, personal: 11.0, gold: 9.0, education: 8.5, bike: 12.5, property: 9.5 }
  },
  {
    name: "HDFC Bank",
    country: "IN",
    type: "RLLR",
    lastUpdated: "2026-03-01",
    rates: { home: 8.75, car: 9.1, personal: 10.5, business: 15.0, gold: 9.5, credit: 36.0 }
  },
  {
    name: "ICICI Bank",
    country: "IN",
    type: "EBLR",
    lastUpdated: "2026-03-01",
    rates: { home: 8.75, car: 9.1, personal: 10.75, business: 14.5, gold: 9.2, property: 10.0 }
  },
  {
    name: "LIC Housing",
    country: "IN",
    type: "Fixed/Float",
    lastUpdated: "2026-02-25",
    rates: { home: 8.5, property: 9.75 }
  },
  {
    name: "Bajaj Finserv",
    country: "IN",
    type: "Floating",
    lastUpdated: "2026-03-01",
    rates: { personal: 12.99, business: 16.0, gold: 10.0, property: 10.5 }
  },
  {
    name: "Chase",
    country: "GLOBAL",
    type: "Fixed",
    lastUpdated: "2026-03-01",
    rates: { home: 6.75, car: 5.9, personal: 9.5, business: 8.0 }
  },
  {
    name: "HSBC",
    country: "GLOBAL",
    type: "Variable",
    lastUpdated: "2026-03-01",
    rates: { home: 4.2, personal: 7.5, business: 6.5, credit: 18.0 }
  },
  {
    name: "DBS Bank",
    country: "GLOBAL",
    type: "Fixed",
    lastUpdated: "2026-03-01",
    rates: { home: 3.75, car: 2.5, personal: 6.0, business: 5.5 }
  }
];

export type NumberFormat = "indian" | "western";

export type Currency = "INR" | "USD" | "GBP" | "EUR" | "AED";

export const currencies: Record<Currency, { symbol: string; locale: string }> = {
  INR: { symbol: "₹", locale: "en-IN" },
  USD: { symbol: "$", locale: "en-US" },
  GBP: { symbol: "£", locale: "en-GB" },
  EUR: { symbol: "€", locale: "de-DE" },
  AED: { symbol: "د.إ", locale: "ar-AE" },
};

export function formatCurrency(value: number, format: NumberFormat, currency: Currency = "INR"): string {
  const { symbol, locale } = currencies[currency];
  const groupLocale = format === "indian" ? "en-IN" : "en-US";
  
  const formatted = new Intl.NumberFormat(groupLocale, {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  
  return `${symbol}${formatted}`;
}

export interface LoanTypeConfig {
  label: string;
  defaultPrincipal: number;
  maxPrincipal: number;
  defaultRate: number;
  defaultTenure: number;
  maxTenure: number;
  currency: string;
}

export const loanTypes: Record<string, LoanTypeConfig> = {
  home: {
    label: "Home Loan",
    defaultPrincipal: 5000000,
    maxPrincipal: 200000000,
    defaultRate: 8.5,
    defaultTenure: 240,
    maxTenure: 360,
    currency: "₹",
  },
  car: {
    label: "Car Loan",
    defaultPrincipal: 1000000,
    maxPrincipal: 20000000,
    defaultRate: 9.0,
    defaultTenure: 60,
    maxTenure: 84,
    currency: "₹",
  },
  bike: {
    label: "Two-Wheeler",
    defaultPrincipal: 150000,
    maxPrincipal: 1000000,
    defaultRate: 11.5,
    defaultTenure: 36,
    maxTenure: 60,
    currency: "₹",
  },
  personal: {
    label: "Personal Loan",
    defaultPrincipal: 500000,
    maxPrincipal: 10000000,
    defaultRate: 12.0,
    defaultTenure: 36,
    maxTenure: 60,
    currency: "₹",
  },
  business: {
    label: "Business Loan",
    defaultPrincipal: 2000000,
    maxPrincipal: 50000000,
    defaultRate: 14.0,
    defaultTenure: 60,
    maxTenure: 120,
    currency: "₹",
  },
  gold: {
    label: "Gold Loan",
    defaultPrincipal: 200000,
    maxPrincipal: 5000000,
    defaultRate: 9.5,
    defaultTenure: 12,
    maxTenure: 36,
    currency: "₹",
  },
  property: {
    label: "Property Loan",
    defaultPrincipal: 3000000,
    maxPrincipal: 100000000,
    defaultRate: 10.0,
    defaultTenure: 180,
    maxTenure: 240,
    currency: "₹",
  },
  education: {
    label: "Education Loan",
    defaultPrincipal: 1500000,
    maxPrincipal: 50000000,
    defaultRate: 9.5,
    defaultTenure: 84,
    maxTenure: 180,
    currency: "₹",
  },
  credit: {
    label: "Credit Card",
    defaultPrincipal: 100000,
    maxPrincipal: 2000000,
    defaultRate: 36.0,
    defaultTenure: 12,
    maxTenure: 48,
    currency: "₹",
  },
};
