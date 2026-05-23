'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createIncome,
  deleteIncome,
  listIncomes,
  updateIncome,
  ListIncomesParams,
  CreateIncomePayload,
  UpdateIncomePayload,
} from './api';

export const incomeKeys = {
  list: (params: ListIncomesParams) => ['incomes', 'list', params] as const,
};

export function useIncomes(params: ListIncomesParams = {}) {
  return useQuery({
    queryKey: incomeKeys.list(params),
    queryFn: () => listIncomes(params),
    // Same logic as expenses — 2 min stale; mutations invalidate
    // ['incomes'] so the cache stays correct.
    staleTime: 2 * 60_000,
  });
}

export function useCreateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncomePayload) => createIncome(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useUpdateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIncomePayload }) =>
      updateIncome(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useDeleteIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIncome(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}
