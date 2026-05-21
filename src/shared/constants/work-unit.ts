import type { WorkUnit } from '@entities/daily-report/types';

export const WORK_UNIT_LABEL: Record<WorkUnit, string> = {
  M3: 'м³',
  M2: 'м²',
  M: 'м',
  HOUR: 'ч',
  SHIFT: 'смена',
  PIECE: 'шт',
};

export const WORK_UNIT_OPTIONS: Array<{ value: WorkUnit; label: string }> = (
  Object.keys(WORK_UNIT_LABEL) as WorkUnit[]
).map((v) => ({ value: v, label: WORK_UNIT_LABEL[v] }));

export function formatWorkUnit(value: string): string {
  return WORK_UNIT_LABEL[value as WorkUnit] ?? value;
}
