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
    // Overview агрегирует все объекты + 30-дневные суммы — дорогой запрос.
    // 5 минут считаем свежим, потом фоновое обновление при ре-визите.
    staleTime: 5 * 60_000,
  });
}
