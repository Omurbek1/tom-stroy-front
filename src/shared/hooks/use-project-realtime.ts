'use client';

import { useEffect } from 'react';
import { getSocket } from '@app-init/socket/socket';

/**
 * Subscribes the socket to a project room while the hook is mounted.
 * Use on project detail pages so events for that project are pushed
 * regardless of dashboard subscription.
 */
export function useProjectRealtime(projectId: string | undefined): void {
  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    const subscribe = () => socket.emit('subscribe-project', { projectId });

    if (socket.connected) subscribe();
    socket.on('connect', subscribe);

    return () => {
      socket.off('connect', subscribe);
      if (socket.connected) socket.emit('unsubscribe-project', { projectId });
    };
  }, [projectId]);
}
