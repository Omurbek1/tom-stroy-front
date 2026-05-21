export interface TurnoverRow {
  itemId: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  incomeQty: number;
  writeOffQty: number;
  incomeValue: number;
  writeOffValue: number;
  turnoverValue: number;
  currentQty: number;
  currentValue: number;
}

export type AbcClass = 'A' | 'B' | 'C';

export interface AbcRow extends TurnoverRow {
  cumulativePct: number;
  abcClass: AbcClass;
}

export interface AbcSummary {
  a: number;
  b: number;
  c: number;
  totalValue: number;
}
