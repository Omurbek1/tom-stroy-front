export type ReservationStatus = 'ACTIVE' | 'RELEASED' | 'CONSUMED';

export interface ReservationLine {
  reservationId: string;
  itemId: string;
  qty: number;
  item?: { id: string; name: string; unit: string } | null;
}

export interface WarehouseReservation {
  id: string;
  number: string | null;
  warehouseId: string;
  projectId: string | null;
  status: ReservationStatus;
  note: string | null;
  warehouse?: { id: string; name: string } | null;
  project?: { id: string; name: string } | null;
  lines: ReservationLine[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  closedAt: string | null;
}

export interface CreateReservationPayload {
  warehouseId: string;
  projectId?: string;
  note?: string;
  expiresAt?: string;
  lines: Array<{ itemId: string; qty: number }>;
}
