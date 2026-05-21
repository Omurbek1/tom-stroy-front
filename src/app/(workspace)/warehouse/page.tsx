'use client';

import { Button, Space, Tabs } from 'antd';
import { ImportOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { message } from '@shared/lib/antd-static';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { WarehouseStats } from '@widgets/warehouse/warehouse-stats';
import { InventoryItemsTable } from '@widgets/warehouse/inventory-items-table';
import { TransactionsTable } from '@widgets/warehouse/transactions-table';

export default function WarehousePage() {
  const todo = (label: string) => message.info(`${label} — раздел в разработке`);

  return (
    <>
      <PageHeader
        title="Склад"
        subtitle="Остатки и движение материалов"
        extra={
          <Space>
            <Button icon={<ImportOutlined />} onClick={() => todo('Приход')}>
              Приход
            </Button>
            <Button icon={<ExportOutlined />} onClick={() => todo('Списание')}>
              Списание
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => todo('Новый товар')}>
              Новый товар
            </Button>
          </Space>
        }
      />
      <PageContainer>
        <WarehouseStats />
        <Tabs
          defaultActiveKey="items"
          items={[
            { key: 'items', label: 'Остатки', children: <InventoryItemsTable /> },
            { key: 'txns', label: 'Движение', children: <TransactionsTable /> },
          ]}
        />
      </PageContainer>
    </>
  );
}
