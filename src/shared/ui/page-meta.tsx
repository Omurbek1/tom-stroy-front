'use client';

import { ReactNode, useEffect } from 'react';
import { usePageMetaStore } from '@app-init/store/page-meta-store';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Declarative page-level title block. Renders nothing — registers
 * title/subtitle/actions into the global page-meta store so the
 * UniversalHeader can render them in its sticky bar.
 *
 * Use exactly one per page, at the top of the JSX tree.
 */
export function PageMeta({ title, subtitle, actions }: Props) {
  const setMeta = usePageMetaStore((s) => s.set);

  // `actions` is JSX → referential equality unreliable. Cheap to write
  // on every render; header subscribes via selectors so the cost is one
  // store set per page render, no extra component renders elsewhere.
  useEffect(() => {
    setMeta({ title, subtitle, actions });
  });

  return null;
}
