'use client';

import { ReactNode, useEffect } from 'react';
import { Crumb, usePageMetaStore } from '@app-init/store/page-meta-store';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
}

/**
 * Declarative page-level title block. Renders nothing — registers
 * title/subtitle/actions/breadcrumbs into the global page-meta store so
 * the UniversalHeader can render them in its sticky bar.
 *
 * Use exactly one per page, at the top of the JSX tree.
 */
export function PageMeta({ title, subtitle, actions, breadcrumbs }: Props) {
  const setMeta = usePageMetaStore((s) => s.set);

  // `actions` and `breadcrumbs` are JSX/object → referential equality
  // unreliable. Cheap to write on every render; header subscribes via
  // selectors so the cost is one store set per page render.
  useEffect(() => {
    setMeta({ title, subtitle, actions, breadcrumbs });
  });

  return null;
}
