'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createIncome, listIncomes, ListIncomesParams, CreateIncomePayload } from './api';

export const incomeKeys = {
  list: (params: ListIncomesParams) => ['incomes', 'list', params] as const,
};

export function useIncomes(params: ListIncomesParams = {}) {
  return useQuery({
    queryKey: incomeKeys.list(params),
    queryFn: () => listIncomes(params),
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
