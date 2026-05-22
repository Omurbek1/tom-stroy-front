import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import type {
  CompanyProjectFinance,
  FinanceBreakdown,
  FinanceOperations,
  PnlSummary,
  TimeseriesPoint,
} from './types';

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

export async function getFinanceBreakdown(params: PnlQuery): Promise<FinanceBreakdown> {
  const res = await http.get<ItemResponse<FinanceBreakdown>>(apiRoutes.finance.breakdown, {
    params,
  });
  return res.data.data;
}

export async function getCompanyProjectFinance(params: PnlQuery): Promise<CompanyProjectFinance> {
  const res = await http.get<ItemResponse<CompanyProjectFinance>>(apiRoutes.finance.projects, {
    params,
  });
  return res.data.data;
}

export async function getFinanceOperations(params: PnlQuery): Promise<FinanceOperations> {
  const res = await http.get<ItemResponse<FinanceOperations>>(apiRoutes.finance.operations, {
    params,
  });
  return res.data.data;
}
