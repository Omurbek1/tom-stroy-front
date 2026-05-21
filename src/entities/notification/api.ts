import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { AppNotification } from './types';

export async function listNotifications(params: {
  unread?: boolean;
  limit?: number;
}): Promise<PaginatedResponse<AppNotification>> {
  const res = await http.get<PaginatedResponse<AppNotification>>(apiRoutes.notifications.list, {
    params,
  });
  return res.data;
}

export async function unreadCount(): Promise<number> {
  const res = await http.get<ItemResponse<{ count: number }>>(apiRoutes.notifications.unreadCount);
  return res.data.data.count;
}

export async function markRead(id: string): Promise<void> {
  await http.post(apiRoutes.notifications.markRead(id));
}

export async function markAllRead(): Promise<void> {
  await http.post(apiRoutes.notifications.readAll);
}
