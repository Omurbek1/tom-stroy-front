'use client';

import { Space, Switch, Tabs } from 'antd';
import { useState } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { PageToolbar } from '@shared/ui/page-toolbar';
import { PageSearch } from '@shared/ui/page-search';
import { WarehouseStats } from '@widgets/warehouse/warehouse-stats';
import { InventoryItemsTable } from '@widgets/warehouse/inventory-items-table';
import { TransactionsTable } from '@widgets/warehouse/transactions-table';
import { BalancesTable } from '@widgets/warehouse/balances-table';
import { TransfersTable } from '@widgets/warehouse/transfers-table';
import { StockCountsTable } from '@widgets/warehouse/stock-counts-table';
import { WarehouseAnalytics } from '@widgets/warehouse/warehouse-analytics';
import { ReservationsTable } from '@widgets/warehouse/reservations-table';
import { PurchaseOrdersTable } from '@widgets/purchases/purchase-orders-table';
import { SuppliersTable } from '@widgets/purchases/suppliers-table';
import { ExportWarehouseButton } from '@features/export-warehouse/ui/export-warehouse-button';
import { CreateStockIncomeDrawer } from '@features/create-stock-income/ui/create-stock-income-drawer';
import { CreateStockWriteoffDrawer } from '@features/create-stock-writeoff/ui/create-stock-writeoff-drawer';

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
          </Space>
        }
      />
      <PageContainer>
        <WarehouseStats />
        <Tabs
          defaultActiveKey="items"
          items={[
            {
              key: 'items',
              label: 'Каталог',
              children: <InventoryItemsTable search={search} lowStockOnly={lowStockOnly} />,
            },
            {
              key: 'balances',
              label: 'Остатки',
              children: <BalancesTable />,
            },
            { key: 'txns', label: 'Движение', children: <TransactionsTable /> },
            { key: 'transfers', label: 'Перемещения', children: <TransfersTable /> },
            { key: 'reservations', label: 'Резервы', children: <ReservationsTable /> },
            { key: 'counts', label: 'Инвентаризация', children: <StockCountsTable /> },
            { key: 'purchases', label: 'Закупки', children: <PurchaseOrdersTable /> },
            { key: 'suppliers', label: 'Поставщики', children: <SuppliersTable /> },
            { key: 'analytics', label: 'Аналитика', children: <WarehouseAnalytics /> },
          ]}
        />
      </PageContainer>
    </>
  );
}
