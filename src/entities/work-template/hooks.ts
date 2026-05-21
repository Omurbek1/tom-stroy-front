'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWorkTemplate,
  deleteWorkTemplate,
  listWorkTemplates,
} from './api';

export const workTemplateKeys = {
  list: (brigadeId?: string) => ['work-templates', brigadeId ?? null] as const,
};

export function useWorkTemplates(brigadeId?: string) {
  return useQuery({
    queryKey: workTemplateKeys.list(brigadeId),
    queryFn: () => listWorkTemplates(brigadeId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWorkTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorkTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-templates'] }),
  });
}

export function useDeleteWorkTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-templates'] }),
  });
}
