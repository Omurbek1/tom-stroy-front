'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Input,
  Segmented,
  Skeleton,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FilterOutlined, WarningOutlined } from '@ant-design/icons';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { useInventoryBalances } from '@entities/inventory-item/hooks';
import type { WarehouseBalance } from '@entities/inventory-item/types';
import { CreateInventoryItemButton } from '@features/create-inventory-item/ui/create-inventory-item-button';
import { formatMoney, formatNumber } from '@shared/lib/format';

type StockFilter = 'all' | 'critical' | 'in_stock';

const STOCK_OPTIONS: { value: StockFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'critical', label: 'Критичные' },
  { value: 'in_stock', label: 'В наличии' },
];

export default function MaterialsCatalogPage() {
  const { data, isLoading } = useInventoryBalances({});
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const all: WarehouseBalance[] = data?.data ?? [];
  const filtered = useMemo(() => {
    let rows = all;
    if (stockFilter === 'critical') rows = rows.filter((r) => r.isLow);
    else if (stockFilter === 'in_stock') rows = rows.filter((r) => r.qty > 0);
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.category?.toLowerCase().includes(s) ||
          r.warehouse?.name?.toLowerCase().includes(s),
      );
    }
    return rows;
  }, [all, stockFilter, search]);

  const totals = useMemo(() => {
    const totalValue = filtered.reduce((s, r) => s + r.value, 0);
    const critical = filtered.filter((r) => r.isLow).length;
    return { totalValue, critical, count: filtered.length };
  }, [filtered]);

  const columns: ColumnsType<WarehouseBalance> = [
    {
      title: 'Материал',
      key: 'name',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.name}</div>
          {r.category && (
            <div style={{ fontSize: 11, color: 'var(--color-text-muted, #8c8c8c)' }}>
              {r.category}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Склад',
      key: 'warehouse',
      width: 200,
      ellipsis: true,
      render: (_, r) => r.warehouse?.name ?? '—',
    },
    {
      title: 'Остаток',
      key: 'qty',
      width: 160,
      align: 'right',
      sorter: (a, b) => a.qty - b.qty,
      render: (_, r) => (
        <span>
          <strong style={{ color: r.isLow ? '#cf1322' : undefined }}>
            {formatNumber(r.qty)}
          </strong>
          <span style={{ color: '#bfbfbf', fontSize: 11 }}>
            {' '}/ {formatNumber(r.minStock)} {r.unit}
          </span>
        </span>
      ),
    },
    {
      title: 'Резерв',
      dataIndex: 'reserved',
      key: 'reserved',
      width: 100,
      align: 'right',
      render: (v: number, r) => (v > 0 ? `${formatNumber(v)} ${r.unit}` : '—'),
    },
    {
      title: 'Средняя цена',
      dataIndex: 'avgCost',
      key: 'avgCost',
      width: 140,
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Стоимость',
      dataIndex: 'value',
      key: 'value',
      width: 160,
      align: 'right',
      sorter: (a, b) => a.value - b.value,
      defaultSortOrder: 'descend',
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
    {
      title: 'Статус',
      key: 'status',
      width: 130,
      render: (_, r) =>
        r.isLow ? (
          <Tag color="red" icon={<WarningOutlined />}>
            Низкий
          </Tag>
        ) : r.qty > 0 ? (
          <Tag color="green">В наличии</Tag>
        ) : (
          <Tag>Нет</Tag>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Материалы"
        subtitle="Каталог материалов и инструментов с остатками по всем складам"
        breadcrumbs={[
          { href: '/company', label: 'Компания' },
          { label: 'Материалы' },
        ]}
        actions={<CreateInventoryItemButton />}
        filters={
          <Space wrap size="middle">
            <Segmented<StockFilter>
              value={stockFilter}
              onChange={(v) => setStockFilter(v)}
              options={STOCK_OPTIONS}
            />
            <Input
              prefix={<FilterOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Поиск по названию, категории, складу"
              style={{ width: 320 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Space>
        }
      />
      <PageContainer>
        <Card
          title={
            <Space size={12}>
              <span>Каталог материалов</span>
              <Tag color="blue">{totals.count} позиций</Tag>
              <span
                style={{ color: 'var(--color-text-muted, #8c8c8c)', fontSize: 13 }}
              >
                Стоимость:{' '}
                <strong>{formatMoney(totals.totalValue)}</strong>
              </span>
              {totals.critical > 0 && (
                <Tag color="red" icon={<WarningOutlined />}>
                  {totals.critical} критич.
                </Tag>
              )}
            </Space>
          }
        >
          {isLoading ? (
            <Skeleton active />
          ) : filtered.length === 0 ? (
            <Empty description="Материалов не найдено" />
          ) : (
            <Table<WarehouseBalance>
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={filtered}
              pagination={{ pageSize: 30, showSizeChanger: true }}
              scroll={{ x: 1080 }}
            />
          )}
        </Card>
      </PageContainer>
    </>
  );
}
