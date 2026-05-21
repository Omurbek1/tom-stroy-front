'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createExpense, listExpenses, ListExpensesParams, CreateExpensePayload } from './api';

export const expenseKeys = {
  list: (params: ListExpensesParams) => ['expenses', 'list', params] as const,
};

export function useExpenses(params: ListExpensesParams = {}) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => listExpenses(params),
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
