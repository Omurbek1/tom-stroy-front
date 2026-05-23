'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrigade, fetchBrigadeStats, getBrigade, listBrigades } from './api';
import type { CreateBrigadePayload } from './types';

export const brigadeKeys = {
  all: ['brigades'] as const,
  list: ['brigades', 'list'] as const,
  detail: (id: string) => ['brigades', 'detail', id] as const,
};

// Brigades are a slow-changing directory; bumped to 10 min so BrigadeSelect
// across writeoff / transfer / receipt forms doesn't refetch on each open.
const BRIGADE_STALE = 10 * 60_000;

export function useBrigades() {
  return useQuery({
    queryKey: brigadeKeys.list,
    queryFn: () => listBrigades({ limit: 100 }),
    staleTime: BRIGADE_STALE,
  });
}

export function useBrigade(id: string | undefined) {
  return useQuery({
    queryKey: brigadeKeys.detail(id ?? ''),
    queryFn: () => getBrigade(id as string),
    enabled: !!id,
    staleTime: BRIGADE_STALE,
  });
}

export function useBrigadeStats(
  brigadeId: string | undefined,
  params: { from?: string; to?: string; projectId?: string } = {},
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
