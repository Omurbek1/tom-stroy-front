'use client';

import { ReactNode, use } from 'react';
import { ObjectHeader } from '@widgets/object-workspace/object-header';
import { ObjectTabs } from '@widgets/object-workspace/object-tabs';

interface Props {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Object workspace layout. GitHub / Linear / Jira pattern:
 *
 *   ┌────────────────────────────────────────────────┐
 *   │  ObjectHeader (name, status, progress, action) │
 *   ├────────────────────────────────────────────────┤
 *   │  ObjectTabs (sticky, horizontal scroll)        │
 *   ├────────────────────────────────────────────────┤
 *   │  page content                                  │
 *   └────────────────────────────────────────────────┘
 *
 * No second sidebar. The URL `id` is the single source of truth for
 * `projectId` filtering downstream.
 */
export default function ObjectWorkspaceLayout({ children, params }: Props) {
  const { id } = use(params);
  return (
    <div className="object-workspace">
      <ObjectHeader projectId={id} />
      <ObjectTabs projectId={id} />
      <div className="object-workspace__content">{children}</div>
    </div>
  );
}
