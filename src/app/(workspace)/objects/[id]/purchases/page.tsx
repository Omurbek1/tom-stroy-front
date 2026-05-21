'use client';

import { use } from 'react';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { PurchaseOrdersTable } from '@widgets/purchases/purchase-orders-table';
import { useProject } from '@entities/project/hooks';

/**
 * Purchase orders for this object. `PurchaseOrdersTable` does not yet
 * accept a `projectId` filter — wrapper here just labels the section.
 * Filtering by project will be added when we wire ObjectMember (M1).
 */
export default function ObjectPurchasesPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Закупки объекта"
        subtitle="Заявки на материалы под эту стройку"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Закупки' },
        ]}
      />
      <PageContainer>
        <PurchaseOrdersTable />
      </PageContainer>
    </>
  );
}
