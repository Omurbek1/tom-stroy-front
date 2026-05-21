'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@app-init/store/auth-store';
import { notification } from '@shared/lib/antd-static';
import { disconnectSocket, getSocket } from './socket';

interface DomainEvent {
  type: 'daily-report.created' | 'expense.created' | 'income.created';
  projectId?: string | null;
}

interface NotificationEvent {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  createdAt: string;
}

/**
 * Single point of realtime → React Query invalidation.
 * Mounted once near app root. See docs/ARCHITECTURE.md §9.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const tokens = useAuthStore((s) => s.tokens);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user || !tokens?.accessToken) return;

    const socket = getSocket();
    socket.connect();

    socket.on('connect', () => {
      socket.emit('subscribe-dashboard');
    });

    const onEvent = (evt: DomainEvent) => {
      if (evt.projectId) {
        qc.invalidateQueries({ queryKey: ['projects', 'detail', evt.projectId] });
        qc.invalidateQueries({ queryKey: ['projects', 'analytics', evt.projectId] });
      }
      qc.invalidateQueries({ queryKey: ['projects', 'list'] });
      qc.invalidateQueries({ queryKey: ['daily-reports'] });
      qc.invalidateQueries({ queryKey: ['attendance'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['incomes'] });
      qc.invalidateQueries({ queryKey: ['payroll'] });
    };

    const onNotification = (evt: NotificationEvent) => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      notification.info({
        message: evt.title,
        description: evt.body ?? undefined,
        placement: 'topRight',
        duration: 5,
      });
    };

    socket.on('event', onEvent);
    socket.on('notification', onNotification);

    return () => {
      socket.off('event', onEvent);
      socket.off('notification', onNotification);
      disconnectSocket();
    };
  }, [user, tokens?.accessToken, qc]);

  return <>{children}</>;
}
