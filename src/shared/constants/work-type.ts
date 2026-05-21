import type { WorkType, WorkUnit } from '@entities/daily-report/types';

export const WORK_TYPE_LABEL: Record<WorkType, string> = {
  CONCRETE: 'Бетонные работы',
  FOUNDATION: 'Фундамент',
  MASONRY: 'Кладка',
  PLASTER: 'Штукатурка',
  ROOFING: 'Кровельные работы',
  PLUMBING: 'Сантехника',
  ELECTRICAL: 'Электромонтаж',
  WELDING: 'Сварочные работы',
  FINISHING: 'Отделка',
  EARTHWORKS: 'Земляные работы',
  OTHER: 'Прочее',
};

export function formatWorkType(value: string): string {
  return WORK_TYPE_LABEL[value as WorkType] ?? value;
}

export const WORK_TYPE_CATEGORIES: Array<{ label: string; values: WorkType[] }> = [
  { label: 'Несущие конструкции', values: ['CONCRETE', 'FOUNDATION', 'MASONRY', 'WELDING'] },
  { label: 'Отделка', values: ['PLASTER', 'FINISHING', 'ROOFING'] },
  { label: 'Инженерные сети', values: ['PLUMBING', 'ELECTRICAL'] },
  { label: 'Земляные работы', values: ['EARTHWORKS'] },
  { label: 'Прочее', values: ['OTHER'] },
];

export const DEFAULT_UNIT_FOR_TYPE: Record<WorkType, WorkUnit> = {
  CONCRETE: 'M3',
  FOUNDATION: 'M3',
  MASONRY: 'M3',
  PLASTER: 'M2',
  ROOFING: 'M2',
  FINISHING: 'M2',
  EARTHWORKS: 'M3',
  PLUMBING: 'M',
  ELECTRICAL: 'M',
  WELDING: 'M',
  OTHER: 'PIECE',
};
