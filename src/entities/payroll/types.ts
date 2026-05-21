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
