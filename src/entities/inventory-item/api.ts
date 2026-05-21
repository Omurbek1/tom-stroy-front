import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { PaginatedResponse } from '@shared/types/api';
import type { InventoryItem, InventoryTransaction, InventoryTxnType } from './types';

export interface ListItemsParams {
  warehouseId?: string;
  search?: string;
  lowStock?: boolean;
  cursor?: string;
  limit?: number;
}

export interface ListTxnsParams {
  itemId?: string;
  warehouseId?: string;
  projectId?: string;
  type?: InventoryTxnType;
  cursor?: string;
  limit?: number;
}

export async function listInventoryItems(
  params: ListItemsParams = {},
): Promise<PaginatedResponse<InventoryItem>> {
  const res = await http.get<PaginatedResponse<InventoryItem>>(apiRoutes.inventory.items, {
    params,
  });
  return res.data;
}

export async function listInventoryTransactions(
  params: ListTxnsParams = {},
): Promise<PaginatedResponse<InventoryTransaction>> {
  const res = await http.get<PaginatedResponse<InventoryTransaction>>(
    apiRoutes.inventory.transactions,
    { params },
  );
  return res.data;
}

export interface CreateReceiptPayload {
  lines: { itemId: string; qty: number; unitCost?: number }[];
  note?: string;
}

export async function createReceipt(payload: CreateReceiptPayload): Promise<void> {
  await http.post(apiRoutes.inventory.receipts, payload);
}
