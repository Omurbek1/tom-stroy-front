'use client';

import { use } from 'react';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { useProject } from '@entities/project/hooks';
import { ProjectDocumentsTable } from '@widgets/documents/project-documents-table';

export default function ObjectDocumentsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Документы объекта"
        subtitle="Контракты, акты, чертежи"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Документы' },
        ]}
      />
      <PageContainer>
        <ProjectDocumentsTable projectId={id} />
      </PageContainer>
    </>
  );
}
