import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';

export async function fetchProjectBrief(projectId: string): Promise<string> {
  const res = await http.get<ItemResponse<{ text: string }>>(
    apiRoutes.ai.projectBrief(projectId),
  );
  return res.data.data.text;
}
