export interface SectionStat {
  label: string;
  value: number | string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export interface CompanySection {
  key: string;
  total: number;
  stats: SectionStat[];
}

export type ActivityKind =
  | 'employee_added'
  | 'brigade_created'
  | 'supplier_added'
  | 'vehicle_added'
  | 'warehouse_added'
  | 'purchase_created'
  | 'inventory_writeoff';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle?: string;
  at: string;
  href?: string;
}

export interface CompanyOverview {
  sections: {
    employees: CompanySection;
    brigades: CompanySection;
    vehicles: CompanySection;
    warehouses: CompanySection;
    suppliers: CompanySection;
    materials: CompanySection;
  };
  analytics: {
    payrollAccruedThisMonth: number;
    payrollPaidThisMonth: number;
    fuelCost30d: number;
    worksAmount30d: number;
    stockValue: number;
    purchases30d: number;
  };
  activity: ActivityEvent[];
}
