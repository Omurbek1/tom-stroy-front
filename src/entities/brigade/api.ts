import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { Brigade, BrigadeDetail, CreateBrigadePayload } from './types';

export async function listBrigades(params: {
  limit?: number;
  cursor?: string;
} = {}): Promise<PaginatedResponse<Brigade>> {
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
