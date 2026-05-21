'use client';

import { useQuery } from '@tanstack/react-query';
import { getPayrollPreview, PayrollPreviewParams } from './api';

export const payrollKeys = {
  preview: (params: PayrollPreviewParams) => ['payroll', 'preview', params] as const,
};

export function usePayrollPreview(params: PayrollPreviewParams) {
  return useQuery({
    queryKey: payrollKeys.preview(params),
    queryFn: () => getPayrollPreview(params),
  });
}
