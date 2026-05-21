import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import type { ProjectMember, ProjectMemberRole } from './types';

export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const res = await http.get<ItemResponse<ProjectMember[]>>(apiRoutes.projects.members(projectId));
  return res.data.data;
}

export interface AddMemberPayload {
  employeeId: string;
  role?: ProjectMemberRole;
}

export async function addProjectMember(
  projectId: string,
  payload: AddMemberPayload,
): Promise<ProjectMember> {
  const res = await http.post<ItemResponse<ProjectMember>>(
    apiRoutes.projects.members(projectId),
    payload,
  );
  return res.data.data;
}

export interface AddMembersBulkPayload {
  employeeIds: string[];
  role?: ProjectMemberRole;
}

export async function addProjectMembersBulk(
  projectId: string,
  payload: AddMembersBulkPayload,
): Promise<{ added: number; revived: number }> {
  const res = await http.post<ItemResponse<{ added: number; revived: number }>>(
    apiRoutes.projects.memberBulk(projectId),
    payload,
  );
  return res.data.data;
}

export async function updateProjectMember(
  projectId: string,
  employeeId: string,
  role: ProjectMemberRole,
): Promise<ProjectMember> {
  const res = await http.patch<ItemResponse<ProjectMember>>(
    apiRoutes.projects.member(projectId, employeeId),
    { role },
  );
  return res.data.data;
}

export async function removeProjectMember(
  projectId: string,
  employeeId: string,
): Promise<void> {
  await http.delete(apiRoutes.projects.member(projectId, employeeId));
}
