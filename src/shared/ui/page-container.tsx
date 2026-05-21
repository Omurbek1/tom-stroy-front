'use client';

import { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
}

/**
 * Wraps the body of a page below `<PageHeader>`. Provides consistent
 * padding and vertical rhythm. Scrolling happens on the AppShell content
 * area, not here.
 */
export function PageContainer({ children, style }: Props) {
  return (
    <div className="page-container" style={style}>
      {children}
    </div>
  );
}
