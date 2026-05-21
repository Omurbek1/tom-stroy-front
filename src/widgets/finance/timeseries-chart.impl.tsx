'use client';

import { Card, Skeleton } from 'antd';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinanceTimeseries } from '@entities/finance/hooks';
import { formatMoney } from '@shared/lib/format';

interface Props {
  from: string;
  to: string;
  projectId?: string;
  title?: string;
}

export function FinanceTimeseriesChart({ from, to, projectId, title }: Props) {
  const { data, isLoading } = useFinanceTimeseries({ from, to, projectId });

  return (
    <Card title={title ?? 'Доходы и расходы по дням'}>
      {isLoading || !data ? (
        <Skeleton active />
      ) : (
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 16, left: 16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" stroke="var(--chart-axis)" />
              <YAxis tickFormatter={(v) => formatMoney(v)} width={110} stroke="var(--chart-axis)" />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Доход" stroke="var(--chart-revenue)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="materials" name="Материалы" stroke="var(--chart-materials)" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="labor" name="ФОТ" stroke="var(--chart-labor)" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="equipment" name="Техника" stroke="var(--chart-equipment)" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="other" name="Прочее" stroke="var(--chart-other)" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="profit" name="Прибыль" stroke="var(--chart-profit)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
