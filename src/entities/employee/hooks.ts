'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEmployee, listEmployees, updateEmployee } from './api';
import type { CreateEmployeePayload, UpdateEmployeePayload } from './types';

export const employeeKeys = {
  all: ['employees'] as const,
  list: (search?: string) => ['employees', 'list', { search }] as const,
};

// Headcount changes a few times per week, not per minute. 10 min stale
// time means dropdowns / EmployeeSelect that mount repeatedly across
// pages reuse the cached list, dramatically cutting Supabase hits.
const EMPLOYEE_STALE = 10 * 60_000;

export function useEmployees(search?: string) {
  return useQuery({
    queryKey: employeeKeys.list(search),
    queryFn: () => listEmployees({ search, limit: 200 }),
    staleTime: EMPLOYEE_STALE,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createEmployee(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) =>
      updateEmployee(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}
