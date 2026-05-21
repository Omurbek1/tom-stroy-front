import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type {
  StockCount,
  StockCountListRow,
  StockCountStatus,
  UpdateCountLinePayload,
} from './types';

export interface ListStockCountsParams {
  status?: StockCountStatus;
  warehouseId?: string;
  cursor?: string;
  limit?: number;
}

export async function listStockCounts(
  params: ListStockCountsParams = {},
): Promise<PaginatedResponse<StockCountListRow>> {
  const res = await http.get<PaginatedResponse<StockCountListRow>>(
    apiRoutes.inventory.stockCounts,
    { params },
  );
  return res.data;
}

export async function getStockCount(id: string): Promise<StockCount> {
  const res = await http.get<ItemResponse<StockCount>>(
    apiRoutes.inventory.stockCountDetail(id),
  );
  return res.data.data;
}

export async function openStockCount(payload: {
  warehouseId: string;
  note?: string;
}): Promise<StockCount> {
  const res = await http.post<ItemResponse<StockCount>>(
    apiRoutes.inventory.stockCounts,
    payload,
  );
  return res.data.data;
}

export async function updateStockCountLines(
  id: string,
  lines: UpdateCountLinePayload[],
): Promise<StockCount> {
  const res = await http.patch<ItemResponse<StockCount>>(
    apiRoutes.inventory.stockCountLines(id),
    { lines },
  );
  return res.data.data;
}

export async function submitStockCount(id: string): Promise<StockCount> {
  const res = await http.post<ItemResponse<StockCount>>(
    apiRoutes.inventory.stockCountSubmit(id),
  );
  return res.data.data;
}

export async function approveStockCount(id: string): Promise<StockCount> {
  const res = await http.post<ItemResponse<StockCount>>(
    apiRoutes.inventory.stockCountApprove(id),
  );
  return res.data.data;
}

export async function cancelStockCount(id: string): Promise<StockCount> {
  const res = await http.post<ItemResponse<StockCount>>(
    apiRoutes.inventory.stockCountCancel(id),
  );
  return res.data.data;
}
