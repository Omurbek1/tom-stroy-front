export type TransferStatus = 'PENDING' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';

export interface WarehouseTransferLine {
  transferId: string;
  itemId: string;
  qty: number;
  unitCost: number;
  item?: { id: string; name: string; unit: string } | null;
}

export interface WarehouseTransfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: TransferStatus;
  note: string | null;
  initiatedById: string;
  shippedById: string | null;
  receivedById: string | null;
  fromWarehouse?: { id: string; name: string } | null;
  toWarehouse?: { id: string; name: string } | null;
  lines: WarehouseTransferLine[];
  createdAt: string;
  updatedAt: string;
  shippedAt: string | null;
  receivedAt: string | null;
}

export interface CreateTransferPayload {
  fromWarehouseId: string;
  toWarehouseId: string;
  note?: string;
  lines: Array<{ itemId: string; qty: number }>;
}
