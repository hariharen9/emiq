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
    return { emi: 0, totalInterest: 0, totalAmount: 0, schedule: [] };
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
  };
}

export interface BankRate {
  name: string;
  rate: number;
  type: string;
  country: "IN" | "GLOBAL";
  logo?: string;
}

export const bankRates: BankRate[] = [
  // India - Public Sector
  { name: "SBI", rate: 8.4, type: "EBLR", country: "IN" },
  { name: "Bank of Baroda", rate: 8.4, type: "RLLR", country: "IN" },
  { name: "PNB", rate: 8.45, type: "RLLR", country: "IN" },
  { name: "Canara Bank", rate: 8.5, type: "RLLR", country: "IN" },
  { name: "Union Bank", rate: 8.35, type: "EBLR", country: "IN" },
  
  // India - Private Sector
  { name: "HDFC Bank", rate: 8.75, type: "RLLR", country: "IN" },
  { name: "ICICI Bank", rate: 8.75, type: "EBLR", country: "IN" },
  { name: "Axis Bank", rate: 8.75, type: "MCLR", country: "IN" },
  { name: "Kotak Mahindra", rate: 8.7, type: "RLLR", country: "IN" },
  { name: "IDFC First", rate: 8.85, type: "EBLR", country: "IN" },
  { name: "IndusInd Bank", rate: 8.95, type: "EBLR", country: "IN" },
  { name: "Federal Bank", rate: 8.8, type: "RLLR", country: "IN" },
  
  // India - NBFCs
  { name: "LIC Housing", rate: 8.5, type: "Fixed/Float", country: "IN" },
  { name: "Bajaj Finserv", rate: 8.6, type: "Floating", country: "IN" },
  { name: "Tata Capital", rate: 8.7, type: "Floating", country: "IN" },
  { name: "Godrej Housing", rate: 8.55, type: "Floating", country: "IN" },

  // Global - USA
  { name: "Chase", rate: 6.75, type: "Fixed 30Y", country: "GLOBAL" },
  { name: "Bank of America", rate: 6.82, type: "Fixed 30Y", country: "GLOBAL" },
  { name: "Wells Fargo", rate: 6.9, type: "Fixed 30Y", country: "GLOBAL" },
  { name: "Rocket Mortgage", rate: 6.65, type: "Fixed 30Y", country: "GLOBAL" },
  
  // Global - UK/Europe
  { name: "HSBC", rate: 4.2, type: "Fixed 5Y", country: "GLOBAL" },
  { name: "Barclays", rate: 4.35, type: "Fixed 5Y", country: "GLOBAL" },
  { name: "Santander", rate: 4.4, type: "Variable", country: "GLOBAL" },
  { name: "BNP Paribas", rate: 3.8, type: "Fixed", country: "GLOBAL" },
  
  // Global - Asia/Pacific
  { name: "DBS Bank", rate: 3.75, type: "Fixed", country: "GLOBAL" },
  { name: "OCBC", rate: 3.85, type: "Floating", country: "GLOBAL" },
  { name: "UOB", rate: 3.8, type: "Fixed", country: "GLOBAL" },
  { name: "NAB Australia", rate: 6.1, type: "Variable", country: "GLOBAL" },
  { name: "CommBank", rate: 6.15, type: "Variable", country: "GLOBAL" },
];

export type NumberFormat = "indian" | "western";

export function formatCurrency(value: number, format: NumberFormat, customCurrency?: string): string {
  const currencySymbol = customCurrency || (format === "indian" ? "₹" : "$");
  const locale = format === "indian" ? "en-IN" : "en-US";
  
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
  
  return `${currencySymbol}${formatted}`;
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
