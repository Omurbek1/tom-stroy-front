'use client';

import dynamic from 'next/dynamic';

export const ProjectBriefWidget = dynamic(
  () => import('./project-brief.impl').then((m) => m.ProjectBriefWidget),
  { ssr: false },
);
