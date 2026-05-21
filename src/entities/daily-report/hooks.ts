'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listDailyReports,
  ListDailyReportsParams,
  createDailyReport,
  getDailyReport,
  getDraft,
  saveDraft,
  deleteDraft,
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

export const draftKeys = {
  detail: (projectId: string) => ['daily-report-draft', projectId] as const,
};

export function useReportDraft(projectId: string, enabled = true) {
  return useQuery({
    queryKey: draftKeys.detail(projectId),
    queryFn: () => getDraft(projectId),
    enabled: enabled && !!projectId,
    staleTime: Infinity,
  });
}

export function useSaveReportDraft(projectId: string) {
  return useMutation({
    mutationFn: (args: { payload: Record<string, unknown>; version?: number }) =>
      saveDraft(projectId, args.payload, args.version),
  });
}

export function useDeleteReportDraft(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteDraft(projectId),
    onSuccess: () => qc.removeQueries({ queryKey: draftKeys.detail(projectId) }),
  });
}
