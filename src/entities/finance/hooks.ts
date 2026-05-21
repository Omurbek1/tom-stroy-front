'use client';

import { useQuery } from '@tanstack/react-query';
import { getPnl, getTimeseries, PnlQuery } from './api';

export const financeKeys = {
  pnl: (params: PnlQuery) => ['finance', 'pnl', params] as const,
  timeseries: (params: PnlQuery) => ['finance', 'timeseries', params] as const,
};

export function usePnl(params: PnlQuery) {
  return useQuery({
    queryKey: financeKeys.pnl(params),
    queryFn: () => getPnl(params),
  });
}

export function useFinanceTimeseries(params: PnlQuery) {
  return useQuery({
    queryKey: financeKeys.timeseries(params),
    queryFn: () => getTimeseries(params),
  });
}
