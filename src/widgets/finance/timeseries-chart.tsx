'use client';

import dynamic from 'next/dynamic';
import { Card, Skeleton } from 'antd';

/**
 * Recharts весит ~120KB gzipped. Грузим только когда чарт реально нужен —
 * на дашборде он ниже fold-а, на /finance — после переключения вкладки.
 * SSR выключаем: ResponsiveContainer всё равно требует window.
 */
export const FinanceTimeseriesChart = dynamic(
  () => import('./timeseries-chart.impl').then((m) => m.FinanceTimeseriesChart),
  {
    ssr: false,
    loading: () => (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    ),
  },
);
