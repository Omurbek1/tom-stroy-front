import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { Project, ProjectAnalytics } from './types';

export interface ProjectFilters {
  status?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export async function listProjects(filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> {
  const res = await http.get<PaginatedResponse<Project>>(apiRoutes.projects.list, {
    params: filters,
  });
  return res.data;
}

export async function getProject(id: string): Promise<Project> {
  const res = await http.get<ItemResponse<Project>>(apiRoutes.projects.detail(id));
  return res.data.data;
}

export async function getProjectAnalytics(id: string): Promise<ProjectAnalytics> {
  const res = await http.get<ItemResponse<ProjectAnalytics>>(apiRoutes.projects.analytics(id));
  return res.data.data;
}

export interface CreateProjectPayload {
  name: string;
  address?: string;
  clientId?: string;
  startDate?: string;
  deadline?: string;
  budget?: number;
  planVolume?: number;
  planUnit?: string;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const res = await http.post<ItemResponse<Project>>(apiRoutes.projects.list, payload);
  return res.data.data;
}

export interface ProjectBrigadeRow {
  id: string;
  name: string;
  specialization: string | null;
  foreman: { id: string; fullName: string } | null;
  membersCount: number;
  reportsCount: number;
  lastVisit: string | null;
  totalEarned: number;
  payrollAccrued: number;
  payrollNet: number;
  payrollPaid: number;
  objectBalance: number;
  workBreakdown: Array<{
    workType: string;
    unit: string;
    volume: number;
    amount: number;
    rowsCount: number;
  }>;
  materialBreakdown: Array<{
    itemId: string;
    itemName: string;
    unit: string;
    qty: number;
    total: number;
  }>;
}

export async function listProjectBrigades(projectId: string): Promise<ProjectBrigadeRow[]> {
  const res = await http.get<ItemResponse<ProjectBrigadeRow[]>>(
    apiRoutes.projects.brigades(projectId),
  );
  return res.data.data;
}
