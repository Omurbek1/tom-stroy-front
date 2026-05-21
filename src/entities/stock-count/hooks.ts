'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveStockCount,
  cancelStockCount,
  getStockCount,
  listStockCounts,
  ListStockCountsParams,
  openStockCount,
  submitStockCount,
  updateStockCountLines,
} from './api';
import type { UpdateCountLinePayload } from './types';

export const stockCountKeys = {
  list: (params: ListStockCountsParams) => ['stock-counts', 'list', params] as const,
  detail: (id: string) => ['stock-counts', 'detail', id] as const,
};

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['stock-counts'] });
  qc.invalidateQueries({ queryKey: ['inventory'] });
}

export function useStockCounts(params: ListStockCountsParams = {}) {
  return useQuery({
    queryKey: stockCountKeys.list(params),
    queryFn: () => listStockCounts(params),
  });
}

export function useStockCount(id: string | undefined) {
  return useQuery({
    queryKey: stockCountKeys.detail(id ?? ''),
    queryFn: () => getStockCount(id as string),
    enabled: !!id,
  });
}

export function useOpenStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: openStockCount,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateStockCountLines(id: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lines: UpdateCountLinePayload[]) =>
      updateStockCountLines(id as string, lines),
    onSuccess: (fresh) => {
      if (id) qc.setQueryData(stockCountKeys.detail(id), fresh);
      qc.invalidateQueries({ queryKey: ['stock-counts', 'list'] });
    },
  });
}

export function useSubmitStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitStockCount,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useApproveStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveStockCount,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCancelStockCount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelStockCount,
    onSuccess: () => invalidateAll(qc),
  });
}
