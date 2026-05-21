import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type {
  CreatePurchaseOrderPayload,
  PurchaseOrder,
  PurchaseStatus,
  ReceivePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
} from './types';

export interface ListPurchaseOrdersParams {
  status?: PurchaseStatus;
  supplierId?: string;
  warehouseId?: string;
  projectId?: string;
  cursor?: string;
  limit?: number;
}

export async function listPurchaseOrders(
  params: ListPurchaseOrdersParams = {},
): Promise<PaginatedResponse<PurchaseOrder>> {
  const res = await http.get<PaginatedResponse<PurchaseOrder>>(
    apiRoutes.purchaseOrders.list,
    { params },
  );
  return res.data;
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await http.get<ItemResponse<PurchaseOrder>>(apiRoutes.purchaseOrders.detail(id));
  return res.data.data;
}

export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload,
): Promise<PurchaseOrder> {
  const res = await http.post<ItemResponse<PurchaseOrder>>(
    apiRoutes.purchaseOrders.create,
    payload,
  );
  return res.data.data;
}

export async function updatePurchaseOrder(
  id: string,
  payload: UpdatePurchaseOrderPayload,
): Promise<PurchaseOrder> {
  const res = await http.patch<ItemResponse<PurchaseOrder>>(
    apiRoutes.purchaseOrders.update(id),
    payload,
  );
  return res.data.data;
}

export async function approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await http.post<ItemResponse<PurchaseOrder>>(
    apiRoutes.purchaseOrders.approve(id),
  );
  return res.data.data;
}

export async function markPurchaseOrderOrdered(id: string): Promise<PurchaseOrder> {
  const res = await http.post<ItemResponse<PurchaseOrder>>(
    apiRoutes.purchaseOrders.order(id),
  );
  return res.data.data;
}

export async function receivePurchaseOrder(
  id: string,
  payload: ReceivePurchaseOrderPayload,
): Promise<PurchaseOrder> {
  const res = await http.post<ItemResponse<PurchaseOrder>>(
    apiRoutes.purchaseOrders.receive(id),
    payload,
  );
  return res.data.data;
}

export async function cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const res = await http.post<ItemResponse<PurchaseOrder>>(
    apiRoutes.purchaseOrders.cancel(id),
  );
  return res.data.data;
}
