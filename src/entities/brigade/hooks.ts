'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrigade, fetchBrigadeStats, getBrigade, listBrigades } from './api';
import type { CreateBrigadePayload } from './types';

export const brigadeKeys = {
  all: ['brigades'] as const,
  list: ['brigades', 'list'] as const,
  detail: (id: string) => ['brigades', 'detail', id] as const,
};

export function useBrigades() {
  return useQuery({ queryKey: brigadeKeys.list, queryFn: () => listBrigades({ limit: 100 }) });
}

export function useBrigade(id: string | undefined) {
  return useQuery({
    queryKey: brigadeKeys.detail(id ?? ''),
    queryFn: () => getBrigade(id as string),
    enabled: !!id,
  });
}

export function useBrigadeStats(
  brigadeId: string | undefined,
  params: { from?: string; to?: string } = {},
) {
  return useQuery({
    queryKey: ['brigades', 'stats', brigadeId, params],
    queryFn: () => fetchBrigadeStats(brigadeId as string, params),
    enabled: !!brigadeId,
    staleTime: 60 * 1000,
  });
}

export function useCreateBrigade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBrigadePayload) => createBrigade(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: brigadeKeys.all }),
  });
}
