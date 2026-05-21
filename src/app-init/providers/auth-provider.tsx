'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
