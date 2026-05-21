'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  ListSuppliersParams,
  updateSupplier,
} from './api';
import type { UpdateSupplierPayload } from './types';

export const supplierKeys = {
  list: (params: ListSuppliersParams) => ['suppliers', params] as const,
};

export function useSuppliers(params: ListSuppliersParams = {}) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => listSuppliers(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
      updateSupplier(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}
