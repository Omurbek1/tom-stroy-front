import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type {
  Payroll,
  PayrollDetail,
  PayrollLineKind,
  PayrollPreviewRow,
  PaymentMethod,
} from './types';

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

export interface ListPayrollsParams {
  employeeId?: string;
  status?: string;
  limit?: number;
}

export async function listClosedPayrolls(
  params: ListPayrollsParams = {},
): Promise<PaginatedResponse<Payroll>> {
  const res = await http.get<PaginatedResponse<Payroll>>(apiRoutes.payroll.list, { params });
  return res.data;
}

export async function getPayroll(id: string): Promise<PayrollDetail> {
  const res = await http.get<ItemResponse<PayrollDetail>>(apiRoutes.payroll.detail(id));
  return res.data.data;
}

export async function closePeriod(from: string, to: string): Promise<{ closed: number }> {
  const res = await http.post<ItemResponse<{ closed: number }>>(apiRoutes.payroll.close, {
    from,
    to,
  });
  return res.data.data;
}

export async function addPayrollLine(
  payrollId: string,
  payload: { kind: PayrollLineKind; amount: number; note?: string },
): Promise<void> {
  await http.post(apiRoutes.payroll.addLine(payrollId), payload);
}

export async function addPayrollPayment(
  payrollId: string,
  payload: { amount: number; method?: PaymentMethod },
): Promise<void> {
  await http.post(apiRoutes.payroll.addPayment(payrollId), payload);
}
