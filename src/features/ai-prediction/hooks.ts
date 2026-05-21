'use client';

import { useMutation } from '@tanstack/react-query';
import { fetchProjectBrief } from './api';

export function useProjectBrief(projectId: string) {
  return useMutation({
    mutationFn: () => fetchProjectBrief(projectId),
  });
}
