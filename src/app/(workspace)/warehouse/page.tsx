'use client';

import { Space, Switch } from 'antd';
import { useState } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { PageToolbar } from '@shared/ui/page-toolbar';
import { PageSearch } from '@shared/ui/page-search';
import { WarehouseStats } from '@widgets/warehouse/warehouse-stats';
import { WarehouseTabs } from '@widgets/warehouse/warehouse-tabs';
import { ExportWarehouseButton } from '@features/export-warehouse/ui/export-warehouse-button';
import { CreateStockIncomeDrawer } from '@features/create-stock-income/ui/create-stock-income-drawer';
import { CreateStockWriteoffDrawer } from '@features/create-stock-writeoff/ui/create-stock-writeoff-drawer';
import { CreateInventoryItemButton } from '@features/create-inventory-item/ui/create-inventory-item-button';
import { CreateWarehouseButton } from '@features/create-warehouse/ui/create-warehouse-button';

export default function WarehousePage() {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  return (
    <>
      <PageHeader title="Склад" subtitle="Остатки и движение материалов" />
      <PageToolbar
        search={
          <PageSearch
            placeholder="Поиск товара..."
            value={search}
            onSearch={setSearch}
            onClear={() => setSearch('')}
          />
        }
        filters={
          <Space>
            <Switch checked={lowStockOnly} onChange={setLowStockOnly} />
            <span>Низкие остатки</span>
          </Space>
        }
        actions={
          <Space>
            <CreateStockIncomeDrawer />
            <CreateStockWriteoffDrawer />
            <ExportWarehouseButton />
            <CreateWarehouseButton />
            <CreateInventoryItemButton />
          </Space>
        }
      />
      <PageContainer>
        <WarehouseStats />
        <WarehouseTabs search={search} lowStockOnly={lowStockOnly} />
      </PageContainer>
    </>
  );
}
