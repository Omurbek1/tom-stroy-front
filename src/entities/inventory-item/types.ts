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

export type MovementType =
  | 'INCOME'
  | 'WRITE_OFF'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'ADJUSTMENT_PLUS'
  | 'ADJUSTMENT_MINUS'
  | 'RETURN'
  | 'REVERSE';

export interface WarehouseBalance {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  warehouseId: string;
  warehouse?: { id: string; name: string } | null;
  qty: number;
  avgCost: number;
  minStock: number;
  value: number;
  isLow: boolean;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  warehouseId: string;
  projectId?: string | null;
  type: InventoryTxnType;
  movementType?: MovementType | null;
  qty: number;
  unitCost: number;
  total: number;
  note?: string | null;
  reversesId?: string | null;
  transferGroupId?: string | null;
  createdAt: string;
  item?: { id: string; name: string; unit: string } | null;
  project?: { id: string; name: string } | null;
}
