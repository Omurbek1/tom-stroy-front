'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCompanyProjectFinance,
  getFinanceBreakdown,
  getFinanceOperations,
  getPnl,
  getTimeseries,
  PnlQuery,
} from './api';

export const financeKeys = {
  pnl: (params: PnlQuery) => ['finance', 'pnl', params] as const,
  timeseries: (params: PnlQuery) => ['finance', 'timeseries', params] as const,
  breakdown: (params: PnlQuery) => ['finance', 'breakdown', params] as const,
  projects: (params: PnlQuery) => ['finance', 'projects', params] as const,
  operations: (params: PnlQuery) => ['finance', 'operations', params] as const,
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

export function useFinanceBreakdown(params: PnlQuery) {
  return useQuery({
    queryKey: financeKeys.breakdown(params),
    queryFn: () => getFinanceBreakdown(params),
  });
}

export function useCompanyProjectFinance(params: PnlQuery) {
  return useQuery({
    queryKey: financeKeys.projects(params),
    queryFn: () => getCompanyProjectFinance(params),
  });
}

export function useFinanceOperations(params: PnlQuery) {
  return useQuery({
    queryKey: financeKeys.operations(params),
    queryFn: () => getFinanceOperations(params),
  });
}
