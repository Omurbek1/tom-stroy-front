'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import type { CompanyOverview } from './types';

export function useCompanyHubOverview() {
  return useQuery({
    queryKey: ['analytics', 'company'],
    queryFn: async () => {
      const res = await http.get<ItemResponse<CompanyOverview>>(apiRoutes.analytics.company);
      return res.data.data;
    },
    staleTime: 60_000,
  });
}
