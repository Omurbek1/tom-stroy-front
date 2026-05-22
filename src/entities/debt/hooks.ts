'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addDebtPayment,
  createDebt,
  deleteDebt,
  deleteDebtPayment,
  getDebt,
  listDebtPayments,
  listDebts,
  updateDebt,
  type AddDebtPaymentPayload,
  type CreateDebtPayload,
  type ListDebtsParams,
  type UpdateDebtPayload,
} from './api';

const KEYS = {
  list: (params: ListDebtsParams) => ['debts', 'list', params] as const,
  detail: (id: string) => ['debts', 'detail', id] as const,
  payments: (id: string) => ['debts', 'payments', id] as const,
};

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['debts'] });
  qc.invalidateQueries({ queryKey: ['finance'] });
}

export function useDebts(params: ListDebtsParams = {}) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => listDebts(params) });
}

export function useDebt(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id ?? ''),
    queryFn: () => getDebt(id as string),
    enabled: Boolean(id),
  });
}

export function useDebtPayments(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.payments(id ?? ''),
    queryFn: () => listDebtPayments(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDebtPayload) => createDebt(payload),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDebtPayload }) =>
      updateDebt(id, payload),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDebt(id),
    onSuccess: () => invalidate(qc),
  });
}

export function useAddDebtPayment(debtId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddDebtPaymentPayload) => addDebtPayment(debtId, payload),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteDebtPayment(debtId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => deleteDebtPayment(debtId, paymentId),
    onSuccess: () => invalidate(qc),
  });
}
