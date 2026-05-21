import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { PaginatedResponse } from '@shared/types/api';
import type { Attendance } from './types';

export interface ListAttendanceParams {
  projectId?: string;
  employeeId?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export async function listAttendance(
  params: ListAttendanceParams = {},
): Promise<PaginatedResponse<Attendance>> {
  const res = await http.get<PaginatedResponse<Attendance>>(apiRoutes.attendance.list, {
    params,
  });
  return res.data;
}
