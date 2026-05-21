export type StockCountStatus =
  | 'IN_PROGRESS'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CANCELLED';

export interface StockCountLine {
  stockCountId: string;
  itemId: string;
  expectedQty: number;
  countedQty: number | null;
  variance: number | null;
  note: string | null;
  item?: {
    id: string;
    name: string;
    unit: string;
    category: string | null;
  } | null;
}

export interface StockCount {
  id: string;
  number: string | null;
  warehouseId: string;
  status: StockCountStatus;
  note: string | null;
  startedById: string;
  submittedById: string | null;
  approvedById: string | null;
  warehouse?: { id: string; name: string } | null;
  lines: StockCountLine[];
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
}

export interface StockCountListRow {
  id: string;
  number: string | null;
  warehouseId: string;
  status: StockCountStatus;
  note: string | null;
  warehouse?: { id: string; name: string } | null;
  _count?: { lines: number };
  createdAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
}

export interface UpdateCountLinePayload {
  itemId: string;
  countedQty: number;
  note?: string;
}
