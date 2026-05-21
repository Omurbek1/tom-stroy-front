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
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  var raw = localStorage.getItem('tomstroy.theme');
  var parsed = raw ? JSON.parse(raw) : null;
  var mode = parsed && parsed.state && parsed.state.mode ? parsed.state.mode : 'light';
  document.documentElement.dataset.theme = mode;
} catch (e) {
  document.documentElement.dataset.theme = 'light';
}
`,
          }}
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
