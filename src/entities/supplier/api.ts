import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type {
  CreateSupplierPayload,
  Supplier,
  UpdateSupplierPayload,
} from './types';

export interface ListSuppliersParams {
  search?: string;
  cursor?: string;
  limit?: number;
}

export async function listSuppliers(
  params: ListSuppliersParams = {},
): Promise<PaginatedResponse<Supplier>> {
  const res = await http.get<PaginatedResponse<Supplier>>(apiRoutes.suppliers.list, {
    params,
  });
  return res.data;
}

export async function createSupplier(
  payload: CreateSupplierPayload,
): Promise<Supplier> {
  const res = await http.post<ItemResponse<Supplier>>(apiRoutes.suppliers.create, payload);
  return res.data.data;
}

export async function updateSupplier(
  id: string,
  payload: UpdateSupplierPayload,
): Promise<Supplier> {
  const res = await http.patch<ItemResponse<Supplier>>(
    apiRoutes.suppliers.update(id),
    payload,
  );
  return res.data.data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await http.delete(apiRoutes.suppliers.remove(id));
}
