'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import type { CompanyOverview } from './types';

export function useCompanyOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const res = await http.get<ItemResponse<CompanyOverview>>(apiRoutes.analytics.overview);
      return res.data.data;
    },
  });
}
