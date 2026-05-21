'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markAllRead, markRead, unreadCount } from './api';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unread?: boolean) => ['notifications', 'list', { unread }] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications(unread = false) {
  return useQuery({
    queryKey: notificationKeys.list(unread),
    queryFn: () => listNotifications({ unread, limit: 30 }),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => unreadCount(),
    staleTime: 30_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
