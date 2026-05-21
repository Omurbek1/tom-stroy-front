export type PurchaseStatus =
  | 'DRAFT'
  | 'APPROVED'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderLine {
  id: string;
  purchaseId: string;
  itemId: string;
  qty: number;
  qtyReceived: number;
  unitCost: number;
  total: number;
  item?: { id: string; name: string; unit: string } | null;
}

export interface PurchaseOrder {
  id: string;
  number: string | null;
  supplierId: string;
  warehouseId: string | null;
  projectId: string | null;
  status: PurchaseStatus;
  total: number;
  paid: number;
  note: string | null;
  expectedAt: string | null;
  orderedAt: string | null;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  supplier?: { id: string; name: string; phone?: string | null; email?: string | null } | null;
  warehouse?: { id: string; name: string } | null;
  project?: { id: string; name: string } | null;
  items: PurchaseOrderLine[];
}

export interface PurchaseLinePayload {
  itemId: string;
  qty: number;
  unitCost: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  warehouseId?: string;
  projectId?: string;
  note?: string;
  expectedAt?: string;
  lines: PurchaseLinePayload[];
}

export type UpdatePurchaseOrderPayload = Partial<CreatePurchaseOrderPayload>;

export interface ReceivePurchaseLinePayload {
  itemId: string;
  qty: number;
}

export interface ReceivePurchaseOrderPayload {
  lines: ReceivePurchaseLinePayload[];
  note?: string;
}
