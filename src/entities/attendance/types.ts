export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'SICK_LEAVE' | 'DAY_OFF';

export interface Attendance {
  id: string;
  employeeId: string;
  projectId?: string | null;
  date: string;
  hours: number;
  status: AttendanceStatus;
  employee?: { id: string; fullName: string; role: string } | null;
  project?: { id: string; name: string } | null;
}
