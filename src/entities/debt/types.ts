export type DebtKind = 'PAYABLE' | 'RECEIVABLE';
export type DebtStatus = 'OPEN' | 'PARTIAL' | 'PAID' | 'WRITTEN_OFF';

export interface Debt {
  id: string;
  kind: DebtKind;
  counterparty: string;
  projectId: string | null;
  amount: number;
  paid: number;
  status: DebtStatus;
  dueDate: string | null;
  note: string | null;
  project?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  _count?: { payments: number };
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  method: string | null;
  note: string | null;
  createdAt: string;
}
