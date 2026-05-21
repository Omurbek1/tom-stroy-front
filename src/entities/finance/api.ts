import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import type { PnlSummary, TimeseriesPoint } from './types';

export interface PnlQuery {
  from: string;
  to: string;
  projectId?: string;
}

export async function getPnl(params: PnlQuery): Promise<PnlSummary> {
  const res = await http.get<ItemResponse<PnlSummary>>(apiRoutes.finance.pnl, { params });
  return res.data.data;
}

export async function getTimeseries(params: PnlQuery): Promise<TimeseriesPoint[]> {
  const res = await http.get<ItemResponse<TimeseriesPoint[]>>(apiRoutes.finance.timeseries, {
    params,
  });
  return res.data.data;
}
