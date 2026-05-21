'use client';

import { ReactNode } from 'react';
import { create } from 'zustand';

interface PageMetaState {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  set: (meta: { title: string; subtitle?: string; actions?: ReactNode }) => void;
  reset: () => void;
}

/**
 * Cross-tree page meta. Pages declare their title/subtitle/actions via
 * `<PageMeta>`; `<UniversalHeader>` reads from the same store. This lets
 * the header live above the content while the page still controls its
 * own title declaratively.
 *
 * Updates are cheap (zustand bare set) — header re-renders only when
 * meta actually changes thanks to selectors.
 */
export const usePageMetaStore = create<PageMetaState>((set) => ({
  title: '',
  subtitle: undefined,
  actions: undefined,
  set: (meta) =>
    set({
      title: meta.title,
      subtitle: meta.subtitle,
      actions: meta.actions,
    }),
  reset: () => set({ title: '', subtitle: undefined, actions: undefined }),
}));
