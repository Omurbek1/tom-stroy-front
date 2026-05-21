'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createVehicle,
  listUsages,
  ListUsagesParams,
  listVehicles,
  recordUsage,
} from './api';
import type { CreateUsagePayload, CreateVehiclePayload } from './types';

export const vehicleKeys = {
  list: ['vehicles', 'list'] as const,
  usages: (params: ListUsagesParams) => ['vehicles', 'usages', params] as const,
};

export function useVehicles() {
  return useQuery({
    queryKey: vehicleKeys.list,
    queryFn: () => listVehicles({ limit: 100 }),
  });
}

export function useUsages(params: ListUsagesParams = {}) {
  return useQuery({
    queryKey: vehicleKeys.usages(params),
    queryFn: () => listUsages(params),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useRecordUsage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUsagePayload) => recordUsage(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}
