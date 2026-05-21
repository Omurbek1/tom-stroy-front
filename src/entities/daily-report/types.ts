export type WorkType =
  | 'CONCRETE'
  | 'FOUNDATION'
  | 'MASONRY'
  | 'PLASTER'
  | 'ROOFING'
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'WELDING'
  | 'FINISHING'
  | 'EARTHWORKS'
  | 'OTHER';

export type WorkUnit = 'M3' | 'M2' | 'M' | 'HOUR' | 'SHIFT' | 'PIECE';

export type AttendanceStatus =
  | 'PRESENT'
  | 'LATE'
  | 'ABSENT'
  | 'SICK_LEAVE'
  | 'DAY_OFF';

export interface DailyReport {
  id: string;
  projectId: string;
  brigadeId?: string | null;
  foremanId: string;
  date: string;
  summary?: string | null;
  problems?: string | null;
  status: string;
  brigade?: { id: string; name: string } | null;
  foreman?: { id: string; fullName: string } | null;
  _count?: { works: number; attendance: number; photos: number };
}

export interface DailyReportWorkInput {
  employeeId?: string;
  workType: WorkType;
  unit: WorkUnit;
  volume: number;
  price: number;
  comment?: string;
}

export interface DailyReportMaterialInput {
  itemId: string;
  qty: number;
  unitCost?: number;
}

export interface DailyReportAttendanceInput {
  employeeId: string;
  hours?: number;
  status?: AttendanceStatus;
}

export interface DailyReportPhotoInput {
  kind: 'before' | 'after';
  storageKey: string;
}

export interface CreateDailyReportPayload {
  projectId: string;
  brigadeId?: string;
  foremanId?: string;
  date: string;
  summary?: string;
  problems?: string;
  works?: DailyReportWorkInput[];
  materials?: DailyReportMaterialInput[];
  attendance?: DailyReportAttendanceInput[];
  photos?: DailyReportPhotoInput[];
}
