'use client';

import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  children: ReactNode;
}

export function FormSection({ title, subtitle, extra, children }: Props) {
  return (
    <section
      style={{
        background: 'var(--ant-color-bg-container, #fff)',
        border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
              {subtitle}
            </div>
          )}
        </div>
        {extra && <div>{extra}</div>}
      </header>
      {children}
    </section>
  );
}
