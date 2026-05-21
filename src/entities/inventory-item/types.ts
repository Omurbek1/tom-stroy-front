export interface InventoryItem {
  id: string;
  name: string;
  category?: string | null;
  unit: string;
  onHand: number;
  costPrice: number;
  minStock: number;
  warehouseId: string;
  warehouse?: { id: string; name: string } | null;
}

export type InventoryTxnType = 'RECEIPT' | 'WRITEOFF' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT';

export interface InventoryTransaction {
  id: string;
  itemId: string;
  warehouseId: string;
  projectId?: string | null;
  type: InventoryTxnType;
  qty: number;
  unitCost: number;
  total: number;
  note?: string | null;
  createdAt: string;
  item?: { id: string; name: string; unit: string } | null;
  project?: { id: string; name: string } | null;
}
