import type { ProjectStatus } from '@entities/project/types';

interface StatusMeta {
  label: string;
  color: string;
}

export const PROJECT_STATUS_META: Record<ProjectStatus, StatusMeta> = {
  NEW:         { label: 'Новый',          color: 'default' },
  PREP:        { label: 'Подготовка',     color: 'blue' },
  IN_PROGRESS: { label: 'В работе',       color: 'processing' },
  AT_RISK:     { label: 'В зоне риска',   color: 'orange' },
  LAGGING:     { label: 'Отстаёт',        color: 'gold' },
  OVERDUE:     { label: 'Просрочен',      color: 'red' },
  COMPLETED:   { label: 'Завершён',       color: 'green' },
  FROZEN:      { label: 'Заморожен',      color: 'default' },
};

export function formatProjectStatus(value: string): string {
  return PROJECT_STATUS_META[value as ProjectStatus]?.label ?? value;
}
