'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

/**
 * TipTap + ProseMirror ship ~180KB gzipped. Loaded only when a user
 * opens the document builder; the list/templates pages stay light.
 * SSR off — ProseMirror touches window.
 */
export const RichDocEditor = dynamic(
  () => import('./rich-doc-editor.impl').then((m) => m.RichDocEditorImpl),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: 16 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    ),
  },
);
