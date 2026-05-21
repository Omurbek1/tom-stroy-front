export type InsightKind =
  | 'risk-lagging'
  | 'risk-overdue'
  | 'risk-overrun'
  | 'risk-no-reports'
  | 'risk-low-velocity'
  | 'brief';

export interface AiInsight {
  id: string;
  projectId?: string | null;
  kind: InsightKind | string;
  summary: string;
  payload?: Record<string, unknown> | null;
  validUntil?: string | null;
  createdAt: string;
  project?: { id: string; name: string } | null;
}
