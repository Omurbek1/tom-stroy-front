import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type {
  CreateUsagePayload,
  CreateVehiclePayload,
  Vehicle,
  VehicleUsage,
} from './types';

export async function listVehicles(params: {
  limit?: number;
  cursor?: string;
}): Promise<PaginatedResponse<Vehicle>> {
  const res = await http.get<PaginatedResponse<Vehicle>>(apiRoutes.vehicles.list, { params });
  return res.data;
}

export async function createVehicle(payload: CreateVehiclePayload): Promise<Vehicle> {
  const res = await http.post<ItemResponse<Vehicle>>(apiRoutes.vehicles.create, payload);
  return res.data.data;
}

export interface ListUsagesParams {
  vehicleId?: string;
  projectId?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export async function listUsages(
  params: ListUsagesParams = {},
): Promise<PaginatedResponse<VehicleUsage>> {
  const res = await http.get<PaginatedResponse<VehicleUsage>>(apiRoutes.vehicles.usages, {
    params,
  });
  return res.data;
}

export async function recordUsage(payload: CreateUsagePayload): Promise<VehicleUsage> {
  const res = await http.post<ItemResponse<VehicleUsage>>(apiRoutes.vehicles.usages, payload);
  return res.data.data;
}
