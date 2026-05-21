import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { AiInsight } from './types';

export interface ListInsightsParams {
  projectId?: string;
  kind?: string;
  validOnly?: boolean;
  limit?: number;
  cursor?: string;
}

export async function listInsights(
  params: ListInsightsParams = {},
): Promise<PaginatedResponse<AiInsight>> {
  const res = await http.get<PaginatedResponse<AiInsight>>(apiRoutes.ai.insights, { params });
  return res.data;
}

export async function runInsightsScan(): Promise<{ scanned: number; created: number }> {
  const res = await http.post<ItemResponse<{ scanned: number; created: number }>>(
    apiRoutes.ai.insightsScan,
  );
  return res.data.data;
}

export interface SummarizeReportInput {
  projectId: string;
  summary?: string;
  problems?: string;
  works?: Array<{
    workType: string;
    unit: string;
    volume: number;
    price: number;
    /** Pass employeeId — backend resolves to display name. */
    employeeId?: string;
    employeeName?: string;
  }>;
  materials?: Array<{
    /** Pass itemId — backend resolves to display name + unit. */
    itemId?: string;
    itemName?: string;
    qty: number;
    unit?: string;
    unitCost?: number;
  }>;
  attendance?: Array<{
    employeeId?: string;
    employeeName?: string;
    hours?: number;
    status?: string;
  }>;
}

export interface ReportSummary {
  summary: string;
  risks: string[];
}

export async function summarizeReport(input: SummarizeReportInput): Promise<ReportSummary> {
  const res = await http.post<ItemResponse<ReportSummary>>(
    apiRoutes.ai.summarizeReport,
    input,
  );
  return res.data.data;
}
