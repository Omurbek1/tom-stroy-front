'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPayrollLine,
  addPayrollPayment,
  closePeriod,
  getPayroll,
  getPayrollPreview,
  listClosedPayrolls,
  ListPayrollsParams,
  PayrollPreviewParams,
} from './api';
import type { PayrollLineKind, PaymentMethod } from './types';

export const payrollKeys = {
  preview: (params: PayrollPreviewParams) => ['payroll', 'preview', params] as const,
  list: (params: ListPayrollsParams) => ['payroll', 'list', params] as const,
  detail: (id: string) => ['payroll', 'detail', id] as const,
};

export function usePayroll(id: string | undefined) {
  return useQuery({
    queryKey: payrollKeys.detail(id ?? ''),
    queryFn: () => getPayroll(id as string),
    enabled: !!id,
  });
}

export function usePayrollPreview(params: PayrollPreviewParams) {
  return useQuery({
    queryKey: payrollKeys.preview(params),
    queryFn: () => getPayrollPreview(params),
  });
}

export function useClosedPayrolls(params: ListPayrollsParams = {}) {
  return useQuery({
    queryKey: payrollKeys.list(params),
    queryFn: () => listClosedPayrolls(params),
  });
}

export function useClosePeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) => closePeriod(from, to),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });
}

export function useAddLine(payrollId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { kind: PayrollLineKind; amount: number; note?: string }) =>
      addPayrollLine(payrollId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });
}

export function useAddPayment(payrollId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { amount: number; method?: PaymentMethod }) =>
      addPayrollPayment(payrollId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });
}
