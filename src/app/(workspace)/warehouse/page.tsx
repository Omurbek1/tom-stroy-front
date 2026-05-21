'use client';

import { Tabs } from 'antd';
import { PageHeader } from '@shared/ui/page-header';
import { InventoryItemsTable } from '@widgets/warehouse/inventory-items-table';
import { TransactionsTable } from '@widgets/warehouse/transactions-table';

export default function WarehousePage() {
  return (
    <>
      <PageHeader title="Склад" subtitle="Остатки и движение материалов" />
      <Tabs
        defaultActiveKey="items"
        items={[
          { key: 'items', label: 'Остатки', children: <InventoryItemsTable /> },
          { key: 'txns', label: 'Движение', children: <TransactionsTable /> },
        ]}
      />
    </>
  );
}
