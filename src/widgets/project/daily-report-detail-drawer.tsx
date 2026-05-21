'use client';

import dynamic from 'next/dynamic';

/**
 * Drawer with full report details + photo gallery loads on first click,
 * not when the report list mounts. Saves bundle on the projects list
 * and on the project detail page until the user actually opens a report.
 */
export const DailyReportDetailDrawer = dynamic(
  () => import('./daily-report-detail-drawer.impl').then((m) => m.DailyReportDetailDrawer),
  { ssr: false },
);
