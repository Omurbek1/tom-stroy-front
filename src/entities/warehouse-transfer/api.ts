import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type {
  CreateTransferPayload,
  TransferStatus,
  WarehouseTransfer,
} from './types';

export interface ListTransfersParams {
  status?: TransferStatus;
  warehouseId?: string;
  cursor?: string;
  limit?: number;
}

export async function listTransfers(
  params: ListTransfersParams = {},
): Promise<PaginatedResponse<WarehouseTransfer>> {
  const res = await http.get<PaginatedResponse<WarehouseTransfer>>(
    apiRoutes.inventory.transfers,
    { params },
  );
  return res.data;
}

export async function getTransfer(id: string): Promise<WarehouseTransfer> {
  const res = await http.get<ItemResponse<WarehouseTransfer>>(
    apiRoutes.inventory.transferDetail(id),
  );
  return res.data.data;
}

export async function createTransfer(
  payload: CreateTransferPayload,
): Promise<WarehouseTransfer> {
  const res = await http.post<ItemResponse<WarehouseTransfer>>(
    apiRoutes.inventory.transfers,
    payload,
  );
  return res.data.data;
}

export async function shipTransfer(id: string): Promise<WarehouseTransfer> {
  const res = await http.post<ItemResponse<WarehouseTransfer>>(
    apiRoutes.inventory.transferShip(id),
  );
  return res.data.data;
}

export async function receiveTransfer(id: string): Promise<WarehouseTransfer> {
  const res = await http.post<ItemResponse<WarehouseTransfer>>(
    apiRoutes.inventory.transferReceive(id),
  );
  return res.data.data;
}

export async function cancelTransfer(id: string): Promise<WarehouseTransfer> {
  const res = await http.post<ItemResponse<WarehouseTransfer>>(
    apiRoutes.inventory.transferCancel(id),
  );
  return res.data.data;
}
