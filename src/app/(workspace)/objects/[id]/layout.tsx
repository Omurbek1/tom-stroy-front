'use client';

import { ReactNode, use } from 'react';
import { ObjectSidebar } from '@widgets/object-workspace/object-sidebar';

interface Props {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Object workspace layout. Anything under `/objects/[id]/...` gets a
 * dedicated left sidebar with sections scoped to the object, and the
 * URL `id` is the single source of truth for `projectId` filtering.
 */
export default function ObjectWorkspaceLayout({ children, params }: Props) {
  const { id } = use(params);
  return (
    <div className="object-workspace">
      <ObjectSidebar projectId={id} />
      <div className="object-workspace__content">{children}</div>
    </div>
  );
}
