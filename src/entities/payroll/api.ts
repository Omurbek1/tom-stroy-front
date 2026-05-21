import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import type { PayrollPreviewRow } from './types';

export interface PayrollPreviewParams {
  from: string;
  to: string;
}

export async function getPayrollPreview(
  params: PayrollPreviewParams,
): Promise<PayrollPreviewRow[]> {
  const res = await http.get<ItemResponse<PayrollPreviewRow[]>>(apiRoutes.payroll.preview, {
    params,
  });
  return res.data.data;
}
