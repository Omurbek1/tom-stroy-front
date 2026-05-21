'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listInsights,
  ListInsightsParams,
  runInsightsScan,
  summarizeReport,
} from './api';

export const insightKeys = {
  list: (params: ListInsightsParams) => ['ai', 'insights', params] as const,
};

export function useInsights(params: ListInsightsParams = {}) {
  return useQuery({
    queryKey: insightKeys.list(params),
    queryFn: () => listInsights(params),
  });
}

export function useRunInsightsScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => runInsightsScan(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai', 'insights'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSummarizeReport() {
  return useMutation({ mutationFn: summarizeReport });
}
