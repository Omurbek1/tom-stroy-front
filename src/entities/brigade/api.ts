import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { Brigade, BrigadeDetail, BrigadeStats, CreateBrigadePayload } from './types';

export async function listBrigades(
  params: {
    limit?: number;
    cursor?: string;
    search?: string;
  } = {},
): Promise<PaginatedResponse<Brigade>> {
  const res = await http.get<PaginatedResponse<Brigade>>(apiRoutes.brigades.list, { params });
  return res.data;
}

export async function getBrigade(id: string): Promise<BrigadeDetail> {
  const res = await http.get<ItemResponse<BrigadeDetail>>(`${apiRoutes.brigades.list}/${id}`);
  return res.data.data;
}

export async function createBrigade(payload: CreateBrigadePayload): Promise<Brigade> {
  const res = await http.post<ItemResponse<Brigade>>(apiRoutes.brigades.list, payload);
  return res.data.data;
}

export async function ensureBrigadeWarehouse(brigadeId: string): Promise<string> {
  const res = await http.post<ItemResponse<{ warehouseId: string }>>(
    apiRoutes.brigades.ensureWarehouse(brigadeId),
  );
  return res.data.data.warehouseId;
}

export async function fetchBrigadeStats(
  brigadeId: string,
  params: { from?: string; to?: string } = {},
): Promise<BrigadeStats> {
  const res = await http.get<ItemResponse<BrigadeStats>>(apiRoutes.brigades.stats(brigadeId), {
    params,
  });
  return res.data.data;
}
