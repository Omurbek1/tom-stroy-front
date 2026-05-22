'use client';

import dynamic from 'next/dynamic';
import { Card, Skeleton } from 'antd';

/**
 * Recharts is ~120KB gzipped. Load it lazily — the waterfall sits below
 * the fold on the finance page, so users see KPI tiles & burn-down
 * instantly while this chart streams in.
 */
export const PnlWaterfall = dynamic(
  () => import('./pnl-waterfall.impl').then((m) => m.PnlWaterfall),
  {
    ssr: false,
    loading: () => (
      <Card>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    ),
  },
);
