'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDocument, listDocuments, type ListDocumentsParams } from './api';

export const documentKeys = {
  list: (params: ListDocumentsParams) => ['documents', 'list', params] as const,
};

export function useDocuments(params: ListDocumentsParams = {}) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => listDocuments(params),
  });
}

export function useCreateDocument(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', 'list'] });
      if (projectId) qc.invalidateQueries({ queryKey: documentKeys.list({ projectId, limit: 100 }) });
    },
  });
}
