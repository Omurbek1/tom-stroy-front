'use client';

import { use } from 'react';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { PageToolbar } from '@shared/ui/page-toolbar';
import { UsagesTable } from '@widgets/vehicles/usages-table';
import { useProject } from '@entities/project/hooks';
import { RecordUsageButton } from '@features/record-vehicle-usage/ui/record-usage-button';
import { CreateVehicleButton } from '@features/create-vehicle/ui/create-vehicle-button';

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
      <PageToolbar
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <CreateVehicleButton />
            <RecordUsageButton projectId={id} />
          </div>
        }
      />
      <PageContainer>
        <UsagesTable projectId={id} />
      </PageContainer>
    </>
  );
}
