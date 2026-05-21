'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';

export type WarehouseKind = 'MAIN' | 'PROJECT' | 'BRIGADE' | 'TEMP';

export interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  kind?: WarehouseKind;
  brigadeId?: string | null;
  _count?: { items: number };
}

export interface CreateWarehousePayload {
  name: string;
  address?: string;
  kind?: WarehouseKind;
}

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses', 'list'],
    queryFn: async () => {
      const res = await http.get<PaginatedResponse<Warehouse>>(apiRoutes.warehouses.list);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateWarehousePayload) => {
      const res = await http.post<ItemResponse<Warehouse>>(apiRoutes.warehouses.create, payload);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouses'] }),
  });
}
