export type DocumentKind =
  | 'CONTRACT'
  | 'ACT'
  | 'INVOICE'
  | 'ESTIMATE'
  | 'RECEIPT'
  | 'PHOTO'
  | 'VIDEO'
  | 'OTHER';

export interface DocumentItem {
  id: string;
  projectId?: string | null;
  kind: DocumentKind;
  name: string;
  storageKey: string;
  mime?: string | null;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentPayload {
  projectId?: string;
  kind: DocumentKind;
  name: string;
  storageKey: string;
  mime?: string;
  sizeBytes?: number;
}
