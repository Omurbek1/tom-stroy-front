import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { AppProviders } from '@app-init/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tom-Stroy CRM',
  description: 'AI ERP/CRM для строительной компании',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Required for iOS safe-area-inset-* to work — extends the layout
  // under the notch / home-indicator so we can manually inset bottom nav.
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0d10' },
  ],
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
