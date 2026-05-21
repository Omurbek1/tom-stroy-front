import type { WorkType, WorkUnit } from '@entities/daily-report/types';

export interface WorkTemplate {
  id: string;
  name: string;
  workType: WorkType;
  unit: WorkUnit;
  typicalVolume: number | null;
  defaultPrice: number;
  brigadeId: string | null;
  brigade?: { id: string; name: string } | null;
}

export interface CreateWorkTemplatePayload {
  name: string;
  workType: WorkType;
  unit: WorkUnit;
  typicalVolume?: number;
  defaultPrice: number;
  brigadeId?: string;
}
