'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveDocument,
  createDocument,
  createTemplate,
  deleteDocument,
  deleteTemplate,
  duplicateDocument,
  getDocument,
  getTemplate,
  listDocumentVersions,
  listDocuments,
  listTemplates,
  restoreDocument,
  updateDocument,
  updateTemplate,
  type CreateDocumentPayload,
  type CreateTemplatePayload,
  type ListDocumentsParams,
  type ListTemplatesParams,
  type UpdateDocumentPayload,
  type UpdateTemplatePayload,
} from './api';

const STALE = 60_000;

export const documentBuilderKeys = {
  root: ['document-builder'] as const,
  templates: (params: ListTemplatesParams) =>
    ['document-builder', 'templates', params] as const,
  template: (id: string) => ['document-builder', 'template', id] as const,
  documents: (params: ListDocumentsParams) =>
    ['document-builder', 'documents', params] as const,
  document: (id: string) => ['document-builder', 'document', id] as const,
  versions: (id: string) => ['document-builder', 'versions', id] as const,
};

/* ---------------- Templates ---------------- */

export function useTemplates(params: ListTemplatesParams = {}) {
  return useQuery({
    queryKey: documentBuilderKeys.templates(params),
    queryFn: () => listTemplates(params),
    staleTime: STALE,
  });
}

export function useTemplate(id: string | undefined | null) {
  return useQuery({
    queryKey: documentBuilderKeys.template(id ?? ''),
    queryFn: () => getTemplate(id as string),
    enabled: Boolean(id),
    staleTime: STALE,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) => createTemplate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-builder'] });
    },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      updateTemplate(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-builder'] });
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-builder'] });
    },
  });
}

/* ---------------- Documents ---------------- */

export function useDocuments(params: ListDocumentsParams = {}) {
  return useQuery({
    queryKey: documentBuilderKeys.documents(params),
    queryFn: () => listDocuments(params),
    staleTime: STALE,
  });
}

export function useDocument(id: string | undefined | null) {
  return useQuery({
    queryKey: documentBuilderKeys.document(id ?? ''),
    queryFn: () => getDocument(id as string),
    enabled: Boolean(id),
    staleTime: STALE,
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) => createDocument(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-builder'] });
    },
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocumentPayload }) =>
      updateDocument(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['document-builder'] });
      qc.invalidateQueries({ queryKey: documentBuilderKeys.document(vars.id) });
    },
  });
}

export function useDuplicateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-builder'] });
    },
  });
}

export function useArchiveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-builder'] });
    },
  });
}

export function useRestoreDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-builder'] });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['document-builder'] });
    },
  });
}

export function useDocumentVersions(id: string | undefined | null) {
  return useQuery({
    queryKey: documentBuilderKeys.versions(id ?? ''),
    queryFn: () => listDocumentVersions(id as string),
    enabled: Boolean(id),
    staleTime: STALE,
  });
}
