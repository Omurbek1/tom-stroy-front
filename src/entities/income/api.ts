import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { Income } from './types';

export interface ListIncomesParams {
  projectId?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}

export interface CreateIncomePayload {
  projectId?: string;
  clientId?: string;
  amount: number;
  date: string;
  comment?: string;
}

export async function listIncomes(
  params: ListIncomesParams = {},
): Promise<PaginatedResponse<Income>> {
  const res = await http.get<PaginatedResponse<Income>>(apiRoutes.finance.incomes, { params });
  return res.data;
}

export async function createIncome(payload: CreateIncomePayload): Promise<Income> {
  const res = await http.post<ItemResponse<Income>>(apiRoutes.finance.incomes, payload);
  return res.data.data;
}

export type UpdateIncomePayload = Partial<CreateIncomePayload>;

export async function updateIncome(
  id: string,
  payload: UpdateIncomePayload,
): Promise<Income> {
  const res = await http.patch<ItemResponse<Income>>(
    `${apiRoutes.finance.incomes}/${id}`,
    payload,
  );
  return res.data.data;
}

export async function deleteIncome(id: string): Promise<void> {
  await http.delete(`${apiRoutes.finance.incomes}/${id}`);
}
