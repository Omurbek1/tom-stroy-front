import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { AbcRow, AbcSummary, TurnoverRow } from './types';

interface ListResponse<T> {
  data: T;
  meta?: { days: number };
}

export async function fetchTurnover(days: number = 30): Promise<TurnoverRow[]> {
  const res = await http.get<ListResponse<TurnoverRow[]>>(apiRoutes.inventory.reportsTurnover, {
    params: { days },
  });
  return res.data.data;
}

export async function fetchAbc(
  days: number = 30,
): Promise<{ rows: AbcRow[]; summary: AbcSummary }> {
  const res = await http.get<ListResponse<{ rows: AbcRow[]; summary: AbcSummary }>>(
    apiRoutes.inventory.reportsAbc,
    { params: { days } },
  );
  return res.data.data;
}

export async function refreshReports(): Promise<void> {
  await http.post(apiRoutes.inventory.reportsRefresh);
}
