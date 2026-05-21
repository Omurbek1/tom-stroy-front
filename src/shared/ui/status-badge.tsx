'use client';

import { Tag } from 'antd';

export type ProjectStatus =
  | 'NEW'
  | 'PREP'
  | 'IN_PROGRESS'
  | 'AT_RISK'
  | 'LAGGING'
  | 'OVERDUE'
  | 'COMPLETED'
  | 'FROZEN';

const STATUS_META: Record<ProjectStatus, { label: string; color: string }> = {
  NEW: { label: 'Новый', color: 'default' },
  PREP: { label: 'Подготовка', color: 'cyan' },
  IN_PROGRESS: { label: 'В работе', color: 'blue' },
  AT_RISK: { label: 'Есть риск', color: 'orange' },
  LAGGING: { label: 'Отстаёт', color: 'gold' },
  OVERDUE: { label: 'Просрочен', color: 'red' },
  COMPLETED: { label: 'Завершён', color: 'green' },
  FROZEN: { label: 'Заморожен', color: 'default' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = STATUS_META[status] ?? { label: status, color: 'default' };
  return <Tag color={meta.color}>{meta.label}</Tag>;
}
