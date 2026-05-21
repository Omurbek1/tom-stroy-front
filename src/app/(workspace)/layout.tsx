import { ReactNode } from 'react';
import { AppShell } from '@widgets/app-shell/app-shell';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
