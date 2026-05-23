'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import {
  createInventoryItem,
  CreateInventoryItemPayload,
  createMovement,
  CreateMovementPayload,
  createMovementsBatch,
  createReceipt,
  CreateReceiptPayload,
  listBalances,
  listInventoryItems,
  listInventoryTransactions,
  ListBalancesParams,
  ListItemsParams,
  ListTxnsParams,
  reverseMovement,
} from './api';

export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
  lastMovement: string | null;
  lastMovementType: string | null;
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventory', 'stats'],
    queryFn: async () => {
      const res = await http.get<ItemResponse<InventoryStats>>(apiRoutes.inventory.stats);
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export const inventoryKeys = {
  items: (params: ListItemsParams) => ['inventory', 'items', params] as const,
  balances: (params: ListBalancesParams) =>
    ['inventory', 'balances', params] as const,
  txns: (params: ListTxnsParams) => ['inventory', 'txns', params] as const,
};

// Catalog data — stock changes only via mutations that invalidate
// the cache (`['inventory']`). Push staleTime up so repeat opens of the
// receipt / writeoff modals don't re-fetch the same 200-row list every
// time the user reopens within a few minutes.
const INVENTORY_STALE = 5 * 60_000;

export function useInventoryItems(params: ListItemsParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.items(params),
    queryFn: () => listInventoryItems(params),
    staleTime: INVENTORY_STALE,
  });
}

export function useInventoryTransactions(params: ListTxnsParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.txns(params),
    queryFn: () => listInventoryTransactions(params),
    // Transactions = audit log, updated on every movement, but reading
    // is rarely time-critical. 5 min keeps the tab snappy.
    staleTime: INVENTORY_STALE,
  });
}

export function useCreateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReceiptPayload) => createReceipt(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useInventoryBalances(params: ListBalancesParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.balances(params),
    queryFn: () => listBalances(params),
    staleTime: INVENTORY_STALE,
  });
}

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMovementPayload) => createMovement(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useCreateMovementsBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMovementPayload[]) => createMovementsBatch(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInventoryItemPayload) => createInventoryItem(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useReverseMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      reverseMovement(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}
