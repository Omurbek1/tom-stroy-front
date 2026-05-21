'use client';

import { use } from 'react';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { DailyReportsTable } from '@widgets/project/daily-reports-table';
import { useProject } from '@entities/project/hooks';

export default function ObjectReportsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Отчёты прораба"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Отчёты' },
        ]}
      />
      <PageContainer>
        <DailyReportsTable projectId={id} />
      </PageContainer>
    </>
  );
}
