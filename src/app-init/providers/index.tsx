'use client';

import { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { AntdProvider } from './antd-provider';
import { AuthProvider } from './auth-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AntdProvider>
        <AuthProvider>{children}</AuthProvider>
      </AntdProvider>
    </QueryProvider>
  );
}
