import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import type { CreateWorkTemplatePayload, WorkTemplate } from './types';

export async function listWorkTemplates(brigadeId?: string): Promise<WorkTemplate[]> {
  const res = await http.get<ItemResponse<WorkTemplate[]>>(apiRoutes.workTemplates.list, {
    params: brigadeId ? { brigadeId } : undefined,
  });
  return res.data.data;
}

export async function createWorkTemplate(payload: CreateWorkTemplatePayload): Promise<WorkTemplate> {
  const res = await http.post<ItemResponse<WorkTemplate>>(
    apiRoutes.workTemplates.create,
    payload,
  );
  return res.data.data;
}

export async function deleteWorkTemplate(id: string): Promise<void> {
  await http.delete(apiRoutes.workTemplates.remove(id));
}
