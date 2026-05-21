'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAbc, fetchTurnover, refreshReports } from './api';

export const warehouseReportKeys = {
  turnover: (days: number) => ['warehouse-reports', 'turnover', days] as const,
  abc: (days: number) => ['warehouse-reports', 'abc', days] as const,
};

export function useTurnover(days: number = 30) {
  return useQuery({
    queryKey: warehouseReportKeys.turnover(days),
    queryFn: () => fetchTurnover(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAbcAnalysis(days: number = 30) {
  return useQuery({
    queryKey: warehouseReportKeys.abc(days),
    queryFn: () => fetchAbc(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefreshReports() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: refreshReports,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warehouse-reports'] }),
  });
}
