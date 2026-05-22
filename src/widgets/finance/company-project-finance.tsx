'use client';

import dynamic from 'next/dynamic';
import { Card, Skeleton } from 'antd';

export const CompanyProjectFinanceWidget = dynamic(
  () => import('./company-project-finance.impl').then((m) => m.CompanyProjectFinanceWidget),
  {
    ssr: false,
    loading: () => (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    ),
  },
);
