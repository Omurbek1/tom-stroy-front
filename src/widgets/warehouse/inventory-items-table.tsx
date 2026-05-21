'use client';

import { Card, Input, Space, Switch, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useInventoryItems } from '@entities/inventory-item/hooks';
import type { InventoryItem } from '@entities/inventory-item/types';
import { DataTable } from '@shared/ui/data-table';
import { formatMoney, formatNumber } from '@shared/lib/format';

const columns: ColumnsType<InventoryItem> = [
  {
    title: 'Товар',
    dataIndex: 'name',
    key: 'name',
    render: (v, r) => (
      <div>
        <div style={{ fontWeight: 500 }}>{v}</div>
        {r.category && (
          <Tag color="default" style={{ marginTop: 2, marginRight: 0 }}>
            {r.category}
          </Tag>
        )}
      </div>
    ),
  },
  { title: 'Склад', key: 'wh', render: (_, r) => r.warehouse?.name ?? '—' },
  { title: 'Ед.', dataIndex: 'unit', key: 'unit', width: 90 },
  {
    title: 'Остаток',
    key: 'onHand',
    align: 'right',
    width: 140,
    render: (_, r) => {
      const low = Number(r.onHand) <= Number(r.minStock);
      return (
        <Tooltip title={low ? `Минимум: ${formatNumber(r.minStock)}` : undefined}>
          <span style={{ color: low ? '#cf1322' : undefined, fontWeight: low ? 600 : 400 }}>
            {formatNumber(r.onHand)}
          </span>
        </Tooltip>
      );
    },
  },
  {
    title: 'Себестоимость',
    dataIndex: 'costPrice',
    key: 'costPrice',
    align: 'right',
    width: 160,
    render: (v: number) => formatMoney(v),
  },
];

export function InventoryItemsTable() {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { data, isLoading } = useInventoryItems({
    search: search || undefined,
    lowStock: lowStockOnly || undefined,
    limit: 500,
  });

  const rows = data?.data ?? [];

  return (
    <Card title="Остатки">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space wrap>
          <Input.Search
            placeholder="Поиск по названию"
            allowClear
            onSearch={setSearch}
            style={{ width: 320 }}
          />
          <Space>
            <Switch checked={lowStockOnly} onChange={setLowStockOnly} />
            <span>Только низкие остатки</span>
          </Space>
        </Space>
        <DataTable<InventoryItem>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          minWidth={760}
          scrollY={520}
          emptyTitle="Нет товаров"
          emptyDescription={search ? 'Попробуйте другой запрос' : 'Добавьте первый товар'}
        />
      </Space>
    </Card>
  );
}
