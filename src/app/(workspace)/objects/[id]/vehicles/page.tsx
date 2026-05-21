'use client';

import { use } from 'react';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { UsagesTable } from '@widgets/vehicles/usages-table';
import { useProject } from '@entities/project/hooks';

export default function ObjectVehiclesPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Техника на объекте"
        subtitle="Использование машин и часы работы"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Техника' },
        ]}
      />
      <PageContainer>
        <UsagesTable projectId={id} />
      </PageContainer>
    </>
  );
}
