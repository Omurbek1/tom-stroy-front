'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReceipt,
  listInventoryItems,
  listInventoryTransactions,
  ListItemsParams,
  ListTxnsParams,
  CreateReceiptPayload,
} from './api';

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
