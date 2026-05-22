'use client';

import dynamic from 'next/dynamic';
import { Card, Skeleton } from 'antd';

/**
 * 500+ LOC of tables, charts, aging buckets and modals. Lives below the
 * fold on the finance pages — perfect candidate for lazy split. Cuts
 * /finance and /objects/[id]/finance First Load JS noticeably.
 */
export const FinanceOperationsWidget = dynamic(
  () =>
    import('./finance-operations.impl').then((m) => ({
      default: m.FinanceOperationsWidget,
    })),
  {
    ssr: false,
    loading: () => (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    ),
  },
);
