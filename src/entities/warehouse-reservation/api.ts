import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type {
  CreateReservationPayload,
  ReservationStatus,
  WarehouseReservation,
} from './types';

export interface ListReservationsParams {
  status?: ReservationStatus;
  warehouseId?: string;
  projectId?: string;
  cursor?: string;
  limit?: number;
}

export async function listReservations(
  params: ListReservationsParams = {},
): Promise<PaginatedResponse<WarehouseReservation>> {
  const res = await http.get<PaginatedResponse<WarehouseReservation>>(
    apiRoutes.inventory.reservations,
    { params },
  );
  return res.data;
}

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<WarehouseReservation> {
  const res = await http.post<ItemResponse<WarehouseReservation>>(
    apiRoutes.inventory.reservations,
    payload,
  );
  return res.data.data;
}

export async function releaseReservation(id: string): Promise<WarehouseReservation> {
  const res = await http.post<ItemResponse<WarehouseReservation>>(
    apiRoutes.inventory.reservationRelease(id),
  );
  return res.data.data;
}
