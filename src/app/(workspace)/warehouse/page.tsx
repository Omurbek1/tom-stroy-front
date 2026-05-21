'use client';

import { Button, Dropdown, Space, Switch, Tabs } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { PageToolbar } from '@shared/ui/page-toolbar';
import { PageSearch } from '@shared/ui/page-search';
import { WarehouseStats } from '@widgets/warehouse/warehouse-stats';
import { InventoryItemsTable } from '@widgets/warehouse/inventory-items-table';
import { TransactionsTable } from '@widgets/warehouse/transactions-table';

export default function WarehousePage() {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const todo = (label: string) => message.info(`${label} — раздел в разработке`);

  return (
    <>
      <PageHeader
        title="Склад"
        subtitle="Остатки и движение материалов"
      />
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
            <Button icon={<ImportOutlined />} onClick={() => todo('Приход')}>
              Приход
            </Button>
            <Button icon={<ExportOutlined />} onClick={() => todo('Списание')}>
              Списание
            </Button>
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  { key: 'item', label: 'Материал' },
                  { key: 'purchase', label: 'Закуп' },
                  { key: 'task', label: 'Задача' },
                  { key: 'report', label: 'Отчёт' },
                ],
                onClick: ({ key }) => todo(key),
              }}
            >
              <Button type="primary" icon={<PlusOutlined />}>
                Создать
              </Button>
            </Dropdown>
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
              label: 'Остатки',
              children: <InventoryItemsTable search={search} lowStockOnly={lowStockOnly} />,
            },
            { key: 'txns', label: 'Движение', children: <TransactionsTable /> },
          ]}
        />
      </PageContainer>
    </>
  );
}
