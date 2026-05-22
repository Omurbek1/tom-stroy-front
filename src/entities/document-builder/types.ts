export type DocumentKind =
  | 'CONTRACT'
  | 'ACT'
  | 'INVOICE'
  | 'ESTIMATE'
  | 'RECEIPT'
  | 'OTHER';

export type BuilderDocStatus =
  | 'DRAFT'
  | 'PREPARED'
  | 'SIGNED'
  | 'SENT'
  | 'ARCHIVED';

export interface TemplateVariable {
  name: string;
  label: string;
  type?: 'text' | 'money' | 'date' | 'number';
  hint?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  kind: DocumentKind;
  description: string | null;
  content: string;
  variables: TemplateVariable[] | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuilderDocumentSignature {
  name: string;
  role?: string;
  signedAt?: string;
}

export interface BuilderDocument {
  id: string;
  number: string | null;
  name: string;
  kind: DocumentKind;
  status: BuilderDocStatus;
  templateId: string | null;
  projectId: string | null;
  content: string;
  meta: Record<string, string | number> | null;
  supplierId: string | null;
  employeeId: string | null;
  purchaseId: string | null;
  signatures: BuilderDocumentSignature[] | null;
  createdById: string | null;
  template?: { id: string; name: string } | null;
  project?: { id: string; name: string } | null;
  versions?: BuilderDocumentVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface BuilderDocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: string;
  meta: Record<string, string | number> | null;
  changedBy: string | null;
  createdAt: string;
}

export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  CONTRACT: 'Договор',
  ACT: 'Акт',
  INVOICE: 'Счёт',
  ESTIMATE: 'Смета',
  RECEIPT: 'Накладная',
  OTHER: 'Прочее',
};

export const BUILDER_STATUS_LABEL: Record<BuilderDocStatus, string> = {
  DRAFT: 'Черновик',
  PREPARED: 'Подготовлен',
  SIGNED: 'Подписан',
  SENT: 'Отправлен',
  ARCHIVED: 'Архив',
};

export const BUILDER_STATUS_COLOR: Record<BuilderDocStatus, string> = {
  DRAFT: 'default',
  PREPARED: 'blue',
  SIGNED: 'green',
  SENT: 'cyan',
  ARCHIVED: 'default',
};

export const DOCUMENT_KIND_ORDER: DocumentKind[] = [
  'CONTRACT',
  'ACT',
  'ESTIMATE',
  'INVOICE',
  'RECEIPT',
  'OTHER',
];
