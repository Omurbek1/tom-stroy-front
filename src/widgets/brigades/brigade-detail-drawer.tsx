'use client';

import dynamic from 'next/dynamic';

export const BrigadeDetailDrawer = dynamic(
  () => import('./brigade-detail-drawer.impl').then((m) => m.BrigadeDetailDrawer),
  { ssr: false },
);
