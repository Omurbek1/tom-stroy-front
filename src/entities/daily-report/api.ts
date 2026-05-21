import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { CreateDailyReportPayload, DailyReport, DailyReportDetail } from './types';

export interface ListDailyReportsParams {
  projectId?: string;
  brigadeId?: string;
  from?: string;
  cursor?: string;
  limit?: number;
}

export async function listDailyReports(
  params: ListDailyReportsParams = {},
): Promise<PaginatedResponse<DailyReport>> {
  const res = await http.get<PaginatedResponse<DailyReport>>(apiRoutes.dailyReports.list, {
    params,
  });
  return res.data;
}

export async function getDailyReport(id: string): Promise<DailyReportDetail> {
  const res = await http.get<ItemResponse<DailyReportDetail>>(apiRoutes.dailyReports.detail(id));
  return res.data.data;
}

export async function createDailyReport(
  payload: CreateDailyReportPayload,
): Promise<DailyReport> {
  const res = await http.post<ItemResponse<DailyReport>>(
    apiRoutes.dailyReports.create,
    payload,
  );
  return res.data.data;
}
