export type EmployeeRole =
  | 'FOREMAN'
  | 'MASON'
  | 'CONCRETE'
  | 'PLASTERER'
  | 'PLUMBER'
  | 'ELECTRICIAN'
  | 'WELDER'
  | 'ROOFER'
  | 'DRIVER'
  | 'OPERATOR'
  | 'LABORER'
  | 'FINISHER'
  | 'WAREHOUSE'
  | 'OTHER';

export type PayType =
  | 'PER_CUBE'
  | 'PER_SQM'
  | 'PER_METER'
  | 'PER_SHIFT'
  | 'HOURLY'
  | 'SALARY'
  | 'SALARY_PLUS_PERCENT';

export interface Employee {
  id: string;
  fullName: string;
  phone?: string | null;
  passportNo?: string | null;
  photoUrl?: string | null;
  role: EmployeeRole;
  payType: PayType;
  rate: number;
  isActive: boolean;
}

export interface CreateEmployeePayload {
  fullName: string;
  phone?: string;
  passportNo?: string;
  role: EmployeeRole;
  payType: PayType;
  rate: number;
}

export type UpdateEmployeePayload = Partial<CreateEmployeePayload> & { isActive?: boolean };
