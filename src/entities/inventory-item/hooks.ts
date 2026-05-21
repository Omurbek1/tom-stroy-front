'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import {
  createReceipt,
  listInventoryItems,
  listInventoryTransactions,
  ListItemsParams,
  ListTxnsParams,
  CreateReceiptPayload,
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
  txns: (params: ListTxnsParams) => ['inventory', 'txns', params] as const,
};

export function useInventoryItems(params: ListItemsParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.items(params),
    queryFn: () => listInventoryItems(params),
  });
}

export function useInventoryTransactions(params: ListTxnsParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.txns(params),
    queryFn: () => listInventoryTransactions(params),
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
