'use client';

import { use } from 'react';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { PurchaseOrdersTable } from '@widgets/purchases/purchase-orders-table';
import { useProject } from '@entities/project/hooks';

/**
 * Purchase orders scoped to this object. PurchaseOrdersTable now filters
 * by `projectId` on the backend (см. ListPurchaseOrdersDto).
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
        <PurchaseOrdersTable projectId={id} />
      </PageContainer>
    </>
  );
}
