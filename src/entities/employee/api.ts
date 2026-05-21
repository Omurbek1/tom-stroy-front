import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse, PaginatedResponse } from '@shared/types/api';
import type { CreateEmployeePayload, Employee, UpdateEmployeePayload } from './types';

export async function listEmployees(params: {
  search?: string;
  limit?: number;
  cursor?: string;
} = {}): Promise<PaginatedResponse<Employee>> {
  const res = await http.get<PaginatedResponse<Employee>>(apiRoutes.employees.list, { params });
  return res.data;
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
  const res = await http.post<ItemResponse<Employee>>(apiRoutes.employees.list, payload);
  return res.data.data;
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload,
): Promise<Employee> {
  const res = await http.patch<ItemResponse<Employee>>(
    `${apiRoutes.employees.list}/${id}`,
    payload,
  );
  return res.data.data;
}
