'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { AntdProvider } from './antd-provider';
import { AuthProvider } from './auth-provider';
import { ThemeAttribute } from './theme-attribute';
import { RealtimeProvider } from '../socket/realtime-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AntdProvider>
        <ThemeAttribute />
        <AuthProvider>
          <RealtimeProvider>{children}</RealtimeProvider>
        </AuthProvider>
      </AntdProvider>
    </QueryProvider>
  );
}
