import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { Debt, DebtKind, DebtPayment, DebtStatus } from './types';

export interface ListDebtsParams {
  projectId?: string;
  kind?: DebtKind;
  status?: DebtStatus;
  limit?: number;
  cursor?: string;
}

export async function listDebts(params: ListDebtsParams = {}): Promise<PaginatedResponse<Debt>> {
  const res = await http.get<PaginatedResponse<Debt>>(apiRoutes.finance.debts, { params });
  return res.data;
}

export async function getDebt(id: string): Promise<Debt & { payments: DebtPayment[] }> {
  const res = await http.get<ItemResponse<Debt & { payments: DebtPayment[] }>>(
    apiRoutes.finance.debt(id),
  );
  return res.data.data;
}

export interface CreateDebtPayload {
  kind: DebtKind;
  counterparty: string;
  projectId?: string;
  amount: number;
  dueDate?: string;
  note?: string;
}

export async function createDebt(payload: CreateDebtPayload): Promise<Debt> {
  const res = await http.post<ItemResponse<Debt>>(apiRoutes.finance.debts, payload);
  return res.data.data;
}

export type UpdateDebtPayload = Partial<CreateDebtPayload>;

export async function updateDebt(id: string, payload: UpdateDebtPayload): Promise<Debt> {
  const res = await http.patch<ItemResponse<Debt>>(apiRoutes.finance.debt(id), payload);
  return res.data.data;
}

export async function deleteDebt(id: string): Promise<void> {
  await http.delete(apiRoutes.finance.debt(id));
}

export interface AddDebtPaymentPayload {
  amount: number;
  date: string;
  method?: string;
  note?: string;
}

export async function addDebtPayment(
  id: string,
  payload: AddDebtPaymentPayload,
): Promise<Debt> {
  const res = await http.post<ItemResponse<Debt>>(apiRoutes.finance.debtPayments(id), payload);
  return res.data.data;
}

export async function listDebtPayments(id: string): Promise<DebtPayment[]> {
  const res = await http.get<ItemResponse<DebtPayment[]>>(apiRoutes.finance.debtPayments(id));
  return res.data.data;
}

export async function deleteDebtPayment(id: string, paymentId: string): Promise<void> {
  await http.delete(apiRoutes.finance.debtPayment(id, paymentId));
}
