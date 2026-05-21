'use client';

import { use } from 'react';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { ProjectAnalyticsBlock } from '@widgets/project/project-analytics';
import { useProject } from '@entities/project/hooks';

export default function ObjectAnalyticsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Аналитика объекта"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Аналитика' },
        ]}
      />
      <PageContainer>
        <ProjectAnalyticsBlock projectId={id} />
      </PageContainer>
    </>
  );
}
