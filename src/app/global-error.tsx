'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Last-resort boundary: catches errors thrown above the per-route
 * error.tsx (e.g. in providers, layouts, antd registry). Must render
 * its own <html>/<body>.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[global] fatal error:', error);
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#f4f6f8',
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            background: 'white',
            padding: 32,
            borderRadius: 12,
            maxWidth: 480,
            boxShadow: '0 20px 50px -20px rgba(15,23,42,0.18)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 32, margin: 0, color: '#cf1322' }}>Ошибка приложения</h1>
          <p style={{ color: '#6b7280', marginTop: 12 }}>
            {error.message || 'Произошла неизвестная ошибка'}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              border: 'none',
              borderRadius: 8,
              background: '#1677ff',
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Перезагрузить
          </button>
        </div>
      </body>
    </html>
  );
}
