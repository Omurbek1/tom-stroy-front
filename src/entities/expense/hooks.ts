'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
  ListExpensesParams,
  CreateExpensePayload,
  UpdateExpensePayload,
} from './api';

export const expenseKeys = {
  list: (params: ListExpensesParams) => ['expenses', 'list', params] as const,
};

export function useExpenses(params: ListExpensesParams = {}) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => listExpenses(params),
    // Expenses list is one of the heavier reads (joins project +
    // ordered by date). 2 min stale; mutations invalidate ['expenses'].
    staleTime: 2 * 60_000,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExpensePayload }) =>
      updateExpense(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}
