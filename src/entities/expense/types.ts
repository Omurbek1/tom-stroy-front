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

/**
 * Где висит расход на P&L:
 * - PROJECT    — на конкретном объекте (себестоимость объекта)
 * - COMPANY    — общефирменный (офис, бухгалтерия, маркетинг)
 * - ALLOCATED  — общефирменный, но распределяется на объекты по ключу (revenue/area/etc)
 */
export type ExpenseScope = 'PROJECT' | 'COMPANY' | 'ALLOCATED';

export interface Expense {
  id: string;
  projectId?: string | null;
  scope: ExpenseScope;
  allocationKey?: string | null;
  category: ExpenseCategory;
  amount: number;
  date: string;
  comment?: string | null;
  project?: { id: string; name: string } | null;
}
