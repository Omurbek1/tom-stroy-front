'use client';

import { Tag } from 'antd';
import { PROJECT_STATUS_META } from '@shared/constants/project-status';
import type { ProjectStatus } from '@entities/project/types';

export type { ProjectStatus };

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status] ?? { label: status, color: 'default' };
  return <Tag color={meta.color}>{meta.label}</Tag>;
}
