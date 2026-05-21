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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(v) => formatMoney(v)} width={110} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Доход" stroke="#52c41a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="materials" name="Материалы" stroke="#fa8c16" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="labor" name="ФОТ" stroke="#1677ff" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="other" name="Прочее" stroke="#722ed1" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="profit" name="Прибыль" stroke="#cf1322" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
