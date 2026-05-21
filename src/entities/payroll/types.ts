export type PayType =
  | 'PER_CUBE'
  | 'PER_SQM'
  | 'PER_METER'
  | 'PER_SHIFT'
  | 'HOURLY'
  | 'SALARY'
  | 'SALARY_PLUS_PERCENT';

export interface PayrollPreviewRow {
  employeeId: string;
  fullName: string;
  role: string;
  payType: PayType;
  worksAccrued: number;
  hoursWorked: number;
  daysPresent: number;
}

export type PayrollStatus = 'draft' | 'approved' | 'paid' | 'closed';

export interface Payroll {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  accrued: number;
  advance: number;
  fines: number;
  bonus: number;
  deductions: number;
  paid: number;
  status: PayrollStatus;
  employee?: { id: string; fullName: string; role: string } | null;
  _count?: { lines: number; payments: number };
}

export type PayrollLineKind = 'advance' | 'fine' | 'bonus' | 'deduction';
export type PaymentMethod = 'cash' | 'bank' | 'card';

export interface PayrollLine {
  id: string;
  payrollId: string;
  kind: PayrollLineKind;
  amount: number;
  note?: string | null;
  createdAt: string;
}

export interface PaymentRow {
  id: string;
  payrollId: string;
  amount: number;
  method?: PaymentMethod | null;
  paidAt: string;
}

export interface PayrollDetail extends Payroll {
  lines: PayrollLine[];
  payments: PaymentRow[];
}
