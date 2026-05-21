import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { CreateDocumentPayload, DocumentItem, DocumentKind } from './types';

export interface ListDocumentsParams {
  projectId?: string;
  kind?: DocumentKind;
  limit?: number;
  cursor?: string;
}

export async function listDocuments(
  params: ListDocumentsParams = {},
): Promise<PaginatedResponse<DocumentItem>> {
  const res = await http.get<PaginatedResponse<DocumentItem>>(apiRoutes.documents.list, {
    params,
  });
  return res.data;
}

export async function createDocument(payload: CreateDocumentPayload): Promise<DocumentItem> {
  const res = await http.post<ItemResponse<DocumentItem>>(apiRoutes.documents.create, payload);
  return res.data.data;
}
