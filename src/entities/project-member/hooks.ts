'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addProjectMember,
  addProjectMembersBulk,
  listProjectMembers,
  removeProjectMember,
  updateProjectMember,
  type AddMemberPayload,
  type AddMembersBulkPayload,
} from './api';
import type { ProjectMemberRole } from './types';

export const projectMemberKeys = {
  list: (projectId: string) => ['project-members', projectId] as const,
};

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: projectMemberKeys.list(projectId),
    queryFn: () => listProjectMembers(projectId),
    enabled: Boolean(projectId),
  });
}

export function useAddProjectMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMemberPayload) => addProjectMember(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectMemberKeys.list(projectId) });
    },
  });
}

export function useAddProjectMembersBulk(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMembersBulkPayload) => addProjectMembersBulk(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectMemberKeys.list(projectId) });
    },
  });
}

export function useUpdateProjectMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, role }: { employeeId: string; role: ProjectMemberRole }) =>
      updateProjectMember(projectId, employeeId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectMemberKeys.list(projectId) });
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => removeProjectMember(projectId, employeeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectMemberKeys.list(projectId) });
    },
  });
}
