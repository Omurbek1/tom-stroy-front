'use client';

import { Card, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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

interface Props {
  search: string;
  lowStockOnly: boolean;
}

export function InventoryItemsTable({ search, lowStockOnly }: Props) {
  const { data, isLoading } = useInventoryItems({
    search: search || undefined,
    lowStock: lowStockOnly || undefined,
    limit: 500,
  });

  const rows = data?.data ?? [];

  return (
    <Card title="Остатки">
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
    </Card>
  );
}
