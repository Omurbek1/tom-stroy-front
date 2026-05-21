'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelTransfer,
  createTransfer,
  getTransfer,
  listTransfers,
  ListTransfersParams,
  receiveTransfer,
  shipTransfer,
} from './api';

export const transferKeys = {
  list: (params: ListTransfersParams) =>
    ['warehouse-transfers', 'list', params] as const,
  detail: (id: string) => ['warehouse-transfers', 'detail', id] as const,
};

export function useTransfers(params: ListTransfersParams = {}) {
  return useQuery({
    queryKey: transferKeys.list(params),
    queryFn: () => listTransfers(params),
  });
}

export function useTransfer(id: string | undefined) {
  return useQuery({
    queryKey: transferKeys.detail(id ?? ''),
    queryFn: () => getTransfer(id as string),
    enabled: !!id,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['warehouse-transfers'] });
  qc.invalidateQueries({ queryKey: ['inventory'] });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useShipTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shipTransfer,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useReceiveTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: receiveTransfer,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCancelTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelTransfer,
    onSuccess: () => invalidateAll(qc),
  });
}
