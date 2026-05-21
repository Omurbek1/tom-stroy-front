'use client';

import { useQuery } from '@tanstack/react-query';
import { getProject, getProjectAnalytics, listProjects, ProjectFilters } from './api';

export const projectKeys = {
  all: ['projects'] as const,
  list: (filters: ProjectFilters) => ['projects', 'list', filters] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
  analytics: (id: string) => ['projects', 'analytics', id] as const,
};

export function useProjectsList(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => listProjects(filters),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}

export function useProjectAnalytics(id: string) {
  return useQuery({
    queryKey: projectKeys.analytics(id),
    queryFn: () => getProjectAnalytics(id),
    enabled: !!id,
  });
}
