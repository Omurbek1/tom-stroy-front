'use client';

import { use } from 'react';
import { Space } from 'antd';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { PageToolbar } from '@shared/ui/page-toolbar';
import { TransactionsTable } from '@widgets/warehouse/transactions-table';
import { useProject } from '@entities/project/hooks';
import { CreateStockIncomeDrawer } from '@features/create-stock-income/ui/create-stock-income-drawer';
import { CreateStockWriteoffDrawer } from '@features/create-stock-writeoff/ui/create-stock-writeoff-drawer';
import { CreateInventoryItemButton } from '@features/create-inventory-item/ui/create-inventory-item-button';

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
      <PageToolbar
        actions={
          <Space>
            <CreateInventoryItemButton />
            <CreateStockIncomeDrawer />
            <CreateStockWriteoffDrawer projectId={id} />
          </Space>
        }
      />
      <PageContainer>
        <TransactionsTable projectId={id} />
      </PageContainer>
    </>
  );
}
