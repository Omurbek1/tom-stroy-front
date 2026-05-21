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

export interface CompanyOverview {
  activeProjects: number;
  completedThisMonth: number;
  overdueProjects: number;
  totalRevenue30d: number;
  totalCost30d: number;
  totalProfit30d: number;
  averageProgress: number;
  topProfit: ProjectKpi[];
  topLagging: ProjectKpi[];
}
