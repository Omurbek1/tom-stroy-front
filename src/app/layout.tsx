import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AppProviders } from '@app-init/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tom-Stroy CRM',
  description: 'AI ERP/CRM для строительной компании',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
