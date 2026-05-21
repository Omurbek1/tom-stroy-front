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
