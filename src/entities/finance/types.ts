export interface PnlSummary {
  revenue: number;
  materialsCost: number;
  laborCost: number;
  equipmentCost: number;
  otherExpensesTotal: number;
  expensesByCategory: Record<string, number>;
  totalCost: number;
  profit: number;
  margin: number;
}

export interface TimeseriesPoint {
  date: string;
  revenue: number;
  labor: number;
  materials: number;
  equipment: number;
  other: number;
  profit: number;
}

export interface FinanceBreakdown {
  summary: PnlSummary;
  costStructure: Array<{ key: string; name: string; amount: number }>;
  byBrigade: Array<{
    brigadeId: string | null;
    brigadeName: string;
    worksCount: number;
    volume: number;
    laborAmount: number;
    materialsAmount: number;
    totalAmount: number;
  }>;
  byMaterial: Array<{
    itemId: string;
    itemName: string;
    unit: string;
    qty: number;
    amount: number;
    txns: number;
  }>;
  byExpenseCategory: Array<{ category: string; amount: number }>;
}

export interface CompanyProjectFinance {
  totals: {
    revenue: number;
    materialsCost: number;
    laborCost: number;
    equipmentCost: number;
    otherExpensesTotal: number;
    totalCost: number;
    profit: number;
    companyOverhead: number;
    profitAfterOverhead: number;
    margin: number;
  };
  projects: Array<{
    projectId: string;
    projectName: string;
    status: string;
    budget: number;
    revenue: number;
    materialsCost: number;
    laborCost: number;
    equipmentCost: number;
    otherExpensesTotal: number;
    totalCost: number;
    profit: number;
    margin: number;
    worksCount: number;
  }>;
}

export interface FinanceOperations {
  summary: {
    income: number;
    expenses: number;
    payrollAccrued: number;
    advances: number;
    payrollPaid: number;
    payable: number;
    receivable: number;
  };
  operations: Array<{
    id: string;
    date: string;
    type: string;
    label: string;
    counterparty: string;
    projectId: string | null;
    projectName: string | null;
    amount: number;
    direction: 'in' | 'out' | 'neutral' | string;
    note: string | null;
  }>;
  payables: Array<FinanceDebtRow>;
  receivables: Array<FinanceDebtRow>;
  projectScoped: boolean;
}

export interface FinanceDebtRow {
  id: string;
  type: string;
  counterparty: string;
  projectId: string | null;
  projectName: string | null;
  amount: number;
  basis: string;
}
