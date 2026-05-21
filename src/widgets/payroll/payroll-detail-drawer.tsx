'use client';

import dynamic from 'next/dynamic';

export const PayrollDetailDrawer = dynamic(
  () => import('./payroll-detail-drawer.impl').then((m) => m.PayrollDetailDrawer),
  { ssr: false },
);
