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
          <div
            style={{
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-md)',
              lineHeight: 'var(--line-height-md)',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                lineHeight: 'var(--line-height-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
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
