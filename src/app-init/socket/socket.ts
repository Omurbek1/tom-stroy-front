'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function readAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('tomstroy.auth');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { tokens?: { accessToken: string } };
    return parsed.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
}

export function getSocket(): Socket {
  if (socket) return socket;
  const url = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';
  socket = io(url, {
    autoConnect: false,
    auth: (cb) => cb({ token: readAccessToken() ?? '' }),
    transports: ['websocket'],
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
