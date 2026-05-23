'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProject,
  CreateProjectPayload,
  getProject,
  getProjectAnalytics,
  listProjectBrigades,
  listProjects,
  ProjectFilters,
} from './api';

export const projectKeys = {
  all: ['projects'] as const,
  list: (filters: ProjectFilters) => ['projects', 'list', filters] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
  analytics: (id: string) => ['projects', 'analytics', id] as const,
};

// Project list = portfolio dashboard data — projects don't appear/
// disappear every minute. Mutations invalidate `['projects']`. 5 min
// stale eliminates a hit on every workspace page mount.
const PROJECT_LIST_STALE = 5 * 60_000;
// Per-project detail/analytics are written by daily reports and
// movements — keep at 60s so the dashboard reflects reality quickly.
const PROJECT_DETAIL_STALE = 60_000;

export function useProjectsList(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => listProjects(filters),
    staleTime: PROJECT_LIST_STALE,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
    staleTime: PROJECT_DETAIL_STALE,
  });
}

export function useProjectAnalytics(id: string) {
  return useQuery({
    queryKey: projectKeys.analytics(id),
    queryFn: () => getProjectAnalytics(id),
    enabled: !!id,
    staleTime: PROJECT_DETAIL_STALE,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useProjectBrigades(id: string | undefined) {
  return useQuery({
    queryKey: ['projects', 'brigades', id],
    queryFn: () => listProjectBrigades(id as string),
    enabled: !!id,
    staleTime: 60_000,
  });
}
