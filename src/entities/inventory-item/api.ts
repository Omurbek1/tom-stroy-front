import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type {
  InventoryItem,
  InventoryTransaction,
  InventoryTxnType,
  MovementType,
  WarehouseBalance,
} from './types';

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

export interface CreateInventoryItemPayload {
  warehouseId: string;
  name: string;
  category?: string;
  unit?: string;
  onHand?: number;
  costPrice?: number;
  minStock?: number;
}

export async function createInventoryItem(
  payload: CreateInventoryItemPayload,
): Promise<InventoryItem> {
  const res = await http.post<ItemResponse<InventoryItem>>(apiRoutes.inventory.items, payload);
  return res.data.data;
}

export interface ListBalancesParams {
  warehouseId?: string;
  itemId?: string;
  search?: string;
  lowStock?: boolean;
  cursor?: string;
  limit?: number;
}

export async function listBalances(
  params: ListBalancesParams = {},
): Promise<PaginatedResponse<WarehouseBalance>> {
  const res = await http.get<PaginatedResponse<WarehouseBalance>>(
    apiRoutes.inventory.balances,
    {
      params: {
        ...params,
        lowStock: params.lowStock ? 'true' : undefined,
      },
    },
  );
  return res.data;
}

export interface CreateMovementPayload {
  itemId: string;
  warehouseId?: string;
  movementType: Exclude<MovementType, 'REVERSE'>;
  qty: number;
  unitCost?: number;
  projectId?: string;
  reportId?: string;
  transferGroupId?: string;
  note?: string;
}

export async function createMovement(
  payload: CreateMovementPayload,
): Promise<InventoryTransaction> {
  const res = await http.post<ItemResponse<InventoryTransaction>>(
    apiRoutes.inventory.movements,
    payload,
  );
  return res.data.data;
}

export async function createMovementsBatch(
  payload: CreateMovementPayload[],
): Promise<InventoryTransaction[]> {
  const res = await http.post<ItemResponse<InventoryTransaction[]>>(
    apiRoutes.inventory.movementsBatch,
    { movements: payload },
  );
  return res.data.data;
}

export async function reverseMovement(
  id: string,
  note?: string,
): Promise<InventoryTransaction> {
  const res = await http.post<ItemResponse<InventoryTransaction>>(
    apiRoutes.inventory.reverseMovement(id),
    { note },
  );
  return res.data.data;
}
