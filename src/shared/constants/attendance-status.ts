import type { AttendanceStatus } from '@entities/daily-report/types';

interface StatusMeta {
  label: string;
  color: string;
}

export const ATTENDANCE_STATUS_META: Record<AttendanceStatus, StatusMeta> = {
  PRESENT: { label: 'На объекте', color: 'green' },
  LATE: { label: 'Опоздал', color: 'gold' },
  ABSENT: { label: 'Отсутствовал', color: 'red' },
  SICK_LEAVE: { label: 'Больничный', color: 'blue' },
  DAY_OFF: { label: 'Выходной', color: 'default' },
};

export const ATTENDANCE_STATUS_OPTIONS: Array<{ value: AttendanceStatus; label: string }> = (
  Object.keys(ATTENDANCE_STATUS_META) as AttendanceStatus[]
).map((v) => ({ value: v, label: ATTENDANCE_STATUS_META[v].label }));

export function formatAttendanceStatus(value: string): string {
  return ATTENDANCE_STATUS_META[value as AttendanceStatus]?.label ?? value;
}
