import type { ExpenseCategory, ExpenseScope } from '@entities/expense/types';

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  MATERIALS: 'Материалы',
  SALARY:    'Зарплаты',
  EQUIPMENT: 'Техника',
  FUEL:      'Топливо',
  RENT:      'Аренда',
  TOOLS:     'Инструменты',
  TRANSPORT: 'Транспорт',
  TAXES:     'Налоги',
  OTHER:     'Прочее',
};

export const EXPENSE_CATEGORY_OPTIONS: Array<{ value: ExpenseCategory; label: string }> = (
  Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[]
).map((v) => ({ value: v, label: EXPENSE_CATEGORY_LABEL[v] }));

export function formatExpenseCategory(value: string): string {
  return EXPENSE_CATEGORY_LABEL[value as ExpenseCategory] ?? value;
}

export const EXPENSE_SCOPE_LABEL: Record<ExpenseScope, string> = {
  PROJECT:   'На объект',
  COMPANY:   'Общие',
  ALLOCATED: 'Распределяемые',
};

export function formatExpenseScope(value: string): string {
  return EXPENSE_SCOPE_LABEL[value as ExpenseScope] ?? value;
}
