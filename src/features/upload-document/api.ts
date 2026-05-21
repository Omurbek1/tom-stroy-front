import axios from 'axios';
import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';

export type DocumentKind =
  | 'CONTRACT'
  | 'ACT'
  | 'INVOICE'
  | 'ESTIMATE'
  | 'RECEIPT'
  | 'PHOTO'
  | 'VIDEO'
  | 'OTHER';

interface PresignResponse {
  uploadUrl: string;
  storageKey: string;
  expiresInSec: number;
}

export interface UploadResult {
  storageKey: string;
  name: string;
  size: number;
  mime: string;
}

/**
 * Two-step direct upload: presign → PUT to R2.
 * Returns the storage key that can be stored on the parent record
 * (daily report photo, project document, etc.).
 */
export async function uploadFile(
  file: File,
  options: { kind: DocumentKind; projectId?: string; onProgress?: (pct: number) => void },
): Promise<UploadResult> {
  const presign = await http.post<ItemResponse<PresignResponse>>(apiRoutes.documents.presign, {
    kind: options.kind,
    mime: file.type,
    sizeBytes: file.size,
    projectId: options.projectId,
  });
  const { uploadUrl, storageKey } = presign.data.data;

  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (e) => {
      if (e.total && options.onProgress) {
        options.onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });

  return { storageKey, name: file.name, size: file.size, mime: file.type };
}
