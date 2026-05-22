'use client';

import dynamic from 'next/dynamic';
import { Card, Skeleton } from 'antd';

export const FinanceBreakdownWidget = dynamic(
  () => import('./finance-breakdown.impl').then((m) => m.FinanceBreakdownWidget),
  {
    ssr: false,
    loading: () => (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    ),
  },
);
