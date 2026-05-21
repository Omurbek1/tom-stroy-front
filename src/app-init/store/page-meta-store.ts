'use client';

import { ReactNode } from 'react';
import { create } from 'zustand';

export interface Crumb {
  href?: string;
  label: string;
}

interface Meta {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
}

interface PageMetaState extends Meta {
  set: (meta: Meta) => void;
  reset: () => void;
}

/**
 * Cross-tree page meta. Pages declare their title/subtitle/actions/
 * breadcrumbs via `<PageMeta>`; `<UniversalHeader>` reads from the same
 * store. Updates are cheap zustand set — header re-renders only when the
 * selected slice actually changes thanks to selectors.
 */
export const usePageMetaStore = create<PageMetaState>((set) => ({
  title: '',
  subtitle: undefined,
  actions: undefined,
  breadcrumbs: undefined,
  set: (meta) =>
    set({
      title: meta.title,
      subtitle: meta.subtitle,
      actions: meta.actions,
      breadcrumbs: meta.breadcrumbs,
    }),
  reset: () =>
    set({
      title: '',
      subtitle: undefined,
      actions: undefined,
      breadcrumbs: undefined,
    }),
}));
