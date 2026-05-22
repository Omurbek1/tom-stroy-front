import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { Expense, ExpenseCategory, ExpenseScope } from './types';

export interface ListExpensesParams {
  projectId?: string;
  scope?: ExpenseScope;
  category?: ExpenseCategory;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}

export interface CreateExpensePayload {
  projectId?: string;
  scope?: ExpenseScope;
  allocationKey?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  comment?: string;
}

export async function listExpenses(
  params: ListExpensesParams = {},
): Promise<PaginatedResponse<Expense>> {
  const res = await http.get<PaginatedResponse<Expense>>(apiRoutes.finance.expenses, { params });
  return res.data;
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const res = await http.post<ItemResponse<Expense>>(apiRoutes.finance.expenses, payload);
  return res.data.data;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export async function updateExpense(
  id: string,
  payload: UpdateExpensePayload,
): Promise<Expense> {
  const res = await http.patch<ItemResponse<Expense>>(
    `${apiRoutes.finance.expenses}/${id}`,
    payload,
  );
  return res.data.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await http.delete(`${apiRoutes.finance.expenses}/${id}`);
}
