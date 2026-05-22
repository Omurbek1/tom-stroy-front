'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import type { CompanyOverview } from './types';

export interface OverviewParams {
  from?: string;
  to?: string;
}

export function useCompanyOverview(params: OverviewParams = {}) {
  return useQuery({
    queryKey: ['analytics', 'overview', params],
    queryFn: async () => {
      const res = await http.get<ItemResponse<CompanyOverview>>(apiRoutes.analytics.overview, {
        params,
      });
      return res.data.data;
    },
    // Overview агрегирует все объекты — дорогой запрос. 1 минута свежий,
    // потом фоновое обновление при ре-визите. Также кэшируется на бекенде.
    staleTime: 60_000,
  });
}
