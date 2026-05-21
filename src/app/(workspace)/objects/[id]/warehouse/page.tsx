'use client';

import { use } from 'react';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { TransactionsTable } from '@widgets/warehouse/transactions-table';
import { useProject } from '@entities/project/hooks';

export default function ObjectWarehousePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Склад / Материалы"
        subtitle="Списания и приёмки по этому объекту"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Склад' },
        ]}
      />
      <PageContainer>
        <TransactionsTable projectId={id} />
      </PageContainer>
    </>
  );
}
