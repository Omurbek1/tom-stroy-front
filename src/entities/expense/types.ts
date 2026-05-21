export type ExpenseCategory =
  | 'MATERIALS'
  | 'SALARY'
  | 'EQUIPMENT'
  | 'FUEL'
  | 'RENT'
  | 'TOOLS'
  | 'TRANSPORT'
  | 'TAXES'
  | 'OTHER';

export interface Expense {
  id: string;
  projectId?: string | null;
  category: ExpenseCategory;
  amount: number;
  date: string;
  comment?: string | null;
  project?: { id: string; name: string } | null;
}
