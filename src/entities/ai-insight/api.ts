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
