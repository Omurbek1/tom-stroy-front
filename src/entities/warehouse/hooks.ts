'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { PaginatedResponse } from '@shared/types/api';

export interface Warehouse {
  id: string;
  name: string;
  address: string | null;
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
