'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approvePurchaseOrder,
  cancelPurchaseOrder,
  createPurchaseOrder,
  getPurchaseOrder,
  listPurchaseOrders,
  ListPurchaseOrdersParams,
  markPurchaseOrderOrdered,
  receivePurchaseOrder,
  updatePurchaseOrder,
} from './api';
import type {
  CreatePurchaseOrderPayload,
  ReceivePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
} from './types';

export const purchaseOrderKeys = {
  list: (params: ListPurchaseOrdersParams) =>
    ['purchase-orders', 'list', params] as const,
  detail: (id: string) => ['purchase-orders', 'detail', id] as const,
};

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['purchase-orders'] });
  qc.invalidateQueries({ queryKey: ['inventory'] });
}

// PO lifecycle (PENDING → APPROVED → ORDERED → RECEIVED) goes through
// mutations that invalidate the cache, so 2 min stale is safe and keeps
// both list and detail snappy across navigation.
const PO_STALE = 2 * 60_000;

export function usePurchaseOrders(params: ListPurchaseOrdersParams = {}) {
  return useQuery({
    queryKey: purchaseOrderKeys.list(params),
    queryFn: () => listPurchaseOrders(params),
    staleTime: PO_STALE,
  });
}

export function usePurchaseOrder(id: string | undefined) {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id ?? ''),
    queryFn: () => getPurchaseOrder(id as string),
    enabled: !!id,
    staleTime: PO_STALE,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) => createPurchaseOrder(payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePurchaseOrderPayload }) =>
      updatePurchaseOrder(id, payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useApprovePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approvePurchaseOrder,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useMarkPurchaseOrderOrdered() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markPurchaseOrderOrdered,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useReceivePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReceivePurchaseOrderPayload }) =>
      receivePurchaseOrder(id, payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCancelPurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelPurchaseOrder,
    onSuccess: () => invalidateAll(qc),
  });
}
