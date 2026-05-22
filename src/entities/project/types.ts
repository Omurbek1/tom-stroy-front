export type ProjectStatus =
  | 'NEW'
  | 'PREP'
  | 'IN_PROGRESS'
  | 'AT_RISK'
  | 'LAGGING'
  | 'OVERDUE'
  | 'COMPLETED'
  | 'FROZEN';

export type WorkUnit = 'M3' | 'M2' | 'M' | 'HOUR' | 'SHIFT' | 'PIECE';

export interface Project {
  id: string;
  name: string;
  address?: string | null;
  clientId?: string | null;
  client?: { id: string; name: string } | null;
  startDate?: string | null;
  deadline?: string | null;
  status: ProjectStatus;
  progress: number;
  budget: number;
  planVolume: number;
  planUnit: WorkUnit;
  actualCost: number;
  profit: number;
}

export interface ProjectAnalytics {
  progress: number;
  doneVolume: number;
  planVolume: number;
  velocity7d: number;
  forecastDays: number | null;
  revenue: number;
  materialsCost: number;
  laborCost: number;
  equipmentCost: number;
  otherExpensesTotal: number;
  expensesByCategory: Record<string, number>;
  actualCost: number;
  totalCost: number;
  budget: number;
  profit: number;
  margin: number;
  budgetVariance: number;
}
