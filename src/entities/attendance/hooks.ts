'use client';

import { useQuery } from '@tanstack/react-query';
import { listAttendance, ListAttendanceParams } from './api';

export const attendanceKeys = {
  list: (params: ListAttendanceParams) => ['attendance', 'list', params] as const,
};

export function useAttendance(params: ListAttendanceParams = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => listAttendance(params),
  });
}
