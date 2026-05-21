'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listDailyReports,
  ListDailyReportsParams,
  createDailyReport,
  getDailyReport,
} from './api';
import { projectKeys } from '@entities/project/hooks';
import type { CreateDailyReportPayload } from './types';

export const dailyReportKeys = {
  list: (params: ListDailyReportsParams) => ['daily-reports', 'list', params] as const,
  detail: (id: string) => ['daily-reports', 'detail', id] as const,
};

export function useDailyReports(params: ListDailyReportsParams) {
  return useQuery({
    queryKey: dailyReportKeys.list(params),
    queryFn: () => listDailyReports(params),
    enabled: !!params.projectId,
  });
}

export function useDailyReport(id: string | undefined) {
  return useQuery({
    queryKey: dailyReportKeys.detail(id ?? ''),
    queryFn: () => getDailyReport(id as string),
    enabled: !!id,
    // presigned photo URLs expire in 15 min — keep responses short-lived
    staleTime: 10 * 60 * 1000,
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
