export type NotificationType =
  | 'WORKER_ABSENT'
  | 'PROJECT_LAGGING'
  | 'DEADLINE_APPROACHING'
  | 'STOCK_LOW'
  | 'OVERRUN_DETECTED'
  | 'SALARY_DUE'
  | 'PAYMENT_OVERDUE'
  | 'AI_INSIGHT'
  | 'CUSTOM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  payload?: { projectId?: string; reportId?: string } | null;
  readAt?: string | null;
  createdAt: string;
}
