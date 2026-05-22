import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type {
  BuilderDocStatus,
  BuilderDocument,
  BuilderDocumentSignature,
  BuilderDocumentVersion,
  DocumentKind,
  DocumentTemplate,
  TemplateVariable,
} from './types';

/* ---------------- Templates ---------------- */

export interface ListTemplatesParams {
  kind?: DocumentKind;
  search?: string;
  limit?: number;
  cursor?: string;
}

export interface CreateTemplatePayload {
  name: string;
  kind: DocumentKind;
  description?: string;
  content: string;
  variables?: TemplateVariable[];
}

export type UpdateTemplatePayload = Partial<CreateTemplatePayload>;

export async function listTemplates(
  params: ListTemplatesParams = {},
): Promise<PaginatedResponse<DocumentTemplate>> {
  const res = await http.get<PaginatedResponse<DocumentTemplate>>(
    apiRoutes.documentBuilder.templates,
    { params },
  );
  return res.data;
}

export async function getTemplate(id: string): Promise<DocumentTemplate> {
  const res = await http.get<ItemResponse<DocumentTemplate>>(
    apiRoutes.documentBuilder.template(id),
  );
  return res.data.data;
}

export async function createTemplate(
  payload: CreateTemplatePayload,
): Promise<DocumentTemplate> {
  const res = await http.post<ItemResponse<DocumentTemplate>>(
    apiRoutes.documentBuilder.templates,
    payload,
  );
  return res.data.data;
}

export async function updateTemplate(
  id: string,
  payload: UpdateTemplatePayload,
): Promise<DocumentTemplate> {
  const res = await http.patch<ItemResponse<DocumentTemplate>>(
    apiRoutes.documentBuilder.template(id),
    payload,
  );
  return res.data.data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await http.delete(apiRoutes.documentBuilder.template(id));
}

/* ---------------- Documents ---------------- */

export interface ListDocumentsParams {
  kind?: DocumentKind;
  status?: BuilderDocStatus;
  projectId?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}

export interface CreateDocumentPayload {
  templateId?: string;
  name: string;
  kind: DocumentKind;
  projectId?: string;
  supplierId?: string;
  employeeId?: string;
  purchaseId?: string;
  content?: string;
  meta?: Record<string, string | number>;
}

export interface UpdateDocumentPayload {
  name?: string;
  content?: string;
  meta?: Record<string, string | number>;
  status?: BuilderDocStatus;
  signatures?: BuilderDocumentSignature[];
}

export async function listDocuments(
  params: ListDocumentsParams = {},
): Promise<PaginatedResponse<BuilderDocument>> {
  const res = await http.get<PaginatedResponse<BuilderDocument>>(
    apiRoutes.documentBuilder.documents,
    { params },
  );
  return res.data;
}

export async function getDocument(id: string): Promise<BuilderDocument> {
  const res = await http.get<ItemResponse<BuilderDocument>>(
    apiRoutes.documentBuilder.document(id),
  );
  return res.data.data;
}

export async function createDocument(
  payload: CreateDocumentPayload,
): Promise<BuilderDocument> {
  const res = await http.post<ItemResponse<BuilderDocument>>(
    apiRoutes.documentBuilder.documents,
    payload,
  );
  return res.data.data;
}

export async function updateDocument(
  id: string,
  payload: UpdateDocumentPayload,
): Promise<BuilderDocument> {
  const res = await http.patch<ItemResponse<BuilderDocument>>(
    apiRoutes.documentBuilder.document(id),
    payload,
  );
  return res.data.data;
}

export async function duplicateDocument(id: string): Promise<BuilderDocument> {
  const res = await http.post<ItemResponse<BuilderDocument>>(
    apiRoutes.documentBuilder.duplicate(id),
  );
  return res.data.data;
}

export async function archiveDocument(id: string): Promise<void> {
  await http.post(apiRoutes.documentBuilder.archive(id));
}

export async function restoreDocument(id: string): Promise<BuilderDocument> {
  const res = await http.post<ItemResponse<BuilderDocument>>(
    apiRoutes.documentBuilder.restore(id),
  );
  return res.data.data;
}

export async function deleteDocument(id: string): Promise<void> {
  await http.delete(apiRoutes.documentBuilder.document(id));
}

export async function listDocumentVersions(
  id: string,
): Promise<BuilderDocumentVersion[]> {
  const res = await http.get<
    PaginatedResponse<BuilderDocumentVersion> | ItemResponse<BuilderDocumentVersion[]>
  >(apiRoutes.documentBuilder.versions(id));
  const body = res.data as
    | { data: BuilderDocumentVersion[] }
    | { data: BuilderDocumentVersion[]; meta: unknown };
  return Array.isArray(body.data) ? body.data : [];
}

/**
 * Streams the binary PDF and triggers a download in the browser. Safe to call
 * from any client component — relies on a temporary blob URL revoked after the
 * `<a>` click resolves.
 */
export async function downloadDocumentPdf(
  id: string,
  filename: string,
): Promise<void> {
  const res = await http.get<Blob>(apiRoutes.documentBuilder.pdf(id), {
    responseType: 'blob',
  });
  const blob =
    res.data instanceof Blob
      ? res.data
      : new Blob([res.data as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Defer revoke so Safari can finish the download dialog handshake.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
