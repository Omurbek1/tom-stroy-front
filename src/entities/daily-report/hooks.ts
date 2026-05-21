'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listDailyReports, ListDailyReportsParams, createDailyReport } from './api';
import { projectKeys } from '@entities/project/hooks';
import type { CreateDailyReportPayload } from './types';

export const dailyReportKeys = {
  list: (params: ListDailyReportsParams) => ['daily-reports', 'list', params] as const,
};

export function useDailyReports(params: ListDailyReportsParams) {
  return useQuery({
    queryKey: dailyReportKeys.list(params),
    queryFn: () => listDailyReports(params),
    enabled: !!params.projectId,
  });
}

export function useCreateDailyReport(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDailyReportPayload) => createDailyReport(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-reports'] });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      qc.invalidateQueries({ queryKey: projectKeys.analytics(projectId) });
    },
  });
}
