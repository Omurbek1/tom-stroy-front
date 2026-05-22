export interface ProjectKpi {
  id: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  actualCost: number;
  profit: number;
  margin: number;
  daysLeft: number | null;
}

export type RiskKind =
  | 'overdue'
  | 'over_budget'
  | 'lagging_velocity'
  | 'low_margin'
  | 'no_progress'
  | 'unpaid_payable'
  | 'stale_receivable';

export interface ProjectRisk {
  projectId: string;
  projectName: string;
  severity: 'high' | 'medium' | 'low';
  kind: RiskKind;
  message: string;
}

export interface CriticalStockItem {
  itemId: string;
  name: string;
  unit: string;
  qty: number;
  minQty: number;
  value: number;
}

export interface CompanyOverview {
  period: { from: string; to: string };
  projects: {
    active: number;
    completed: number;
    overdue: number;
    averageProgress: number;
  };
  finance: {
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    projectCost: number;
    companyOverhead: number;
    materialsCost: number;
    laborCost: number;
    equipmentCost: number;
    payrollPaid: number;
    advancesPaid: number;
  };
  debts: { receivable: number; payable: number };
  warehouse: {
    totalValue: number;
    criticalItems: CriticalStockItem[];
  };
  topProfit: ProjectKpi[];
  topCost: ProjectKpi[];
  topLagging: ProjectKpi[];
  risks: ProjectRisk[];
}
