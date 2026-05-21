import type { WorkType } from '@entities/daily-report/types';

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
