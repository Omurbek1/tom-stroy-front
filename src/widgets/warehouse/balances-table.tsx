'use client';

import { Card, Input, Segmented, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import { useInventoryBalances } from '@entities/inventory-item/hooks';
import type { WarehouseBalance } from '@entities/inventory-item/types';
import { formatMoney, formatNumber } from '@shared/lib/format';

type FilterMode = 'all' | 'low' | 'zero';

/**
 * Multi-warehouse balances. Reads from /inventory/balances, falls back to
 * legacy onHand server-side when no balance row exists yet — see
 * MovementsService.listBalances.
 */
export function BalancesTable() {
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<FilterMode>('all');

  const { data, isLoading } = useInventoryBalances({
    search: search || undefined,
    lowStock: mode === 'low' || undefined,
    limit: 200,
  });

  const rows = useMemo(() => {
    const all = data?.data ?? [];
    if (mode === 'zero') return all.filter((r) => r.qty <= 0);
    return all;
  }, [data, mode]);

  const totalValue = useMemo(
    () => rows.reduce((s, r) => s + r.value, 0),
    [rows],
  );

  const columns: ColumnsType<WarehouseBalance> = [
    {
      title: 'Товар',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          {r.category && (
            <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
              {r.category}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Склад',
      key: 'warehouse',
      width: 160,
      render: (_, r) => r.warehouse?.name ?? '—',
    },
    {
      title: 'Остаток',
      dataIndex: 'qty',
      key: 'qty',
      align: 'right',
      width: 130,
      render: (v: number, r) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatNumber(v)} {r.unit}
        </span>
      ),
    },
    {
      title: 'В резерве',
      dataIndex: 'reserved',
      key: 'reserved',
      align: 'right',
      width: 110,
      render: (v: number) =>
        v > 0 ? (
          <Tag color="gold" style={{ fontFamily: 'monospace', margin: 0 }}>
            {formatNumber(v)}
          </Tag>
        ) : (
          <span style={{ color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>—</span>
        ),
    },
    {
      title: 'Доступно',
      dataIndex: 'available',
      key: 'available',
      align: 'right',
      width: 130,
      render: (v: number, r) => (
        <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatNumber(v)} {r.unit}
        </strong>
      ),
    },
    {
      title: 'Мин',
      dataIndex: 'minStock',
      key: 'minStock',
      align: 'right',
      width: 90,
      render: (v: number) => (
        <span style={{ color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
          {formatNumber(v)}
        </span>
      ),
    },
    {
      title: 'Себестоим.',
      dataIndex: 'avgCost',
      key: 'avgCost',
      align: 'right',
      width: 130,
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Стоимость',
      dataIndex: 'value',
      key: 'value',
      align: 'right',
      width: 160,
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
    {
      title: 'Статус',
      key: 'status',
      width: 110,
      render: (_, r) => {
        if (r.qty <= 0) return <Tag color="red">Нет</Tag>;
        if (r.isLow) return <Tag color="gold">Низкий</Tag>;
        return <Tag color="green">OK</Tag>;
      },
    },
  ];

  return (
    <Card
      title="Остатки на складах"
      extra={<strong>Итого: {formatMoney(totalValue)}</strong>}
    >
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="Поиск по названию"
          allowClear
          onSearch={setSearch}
          onChange={(e) => !e.target.value && setSearch('')}
          style={{ width: 280 }}
        />
        <Segmented
          value={mode}
          onChange={(v) => setMode(v as FilterMode)}
          options={[
            { label: 'Все', value: 'all' },
            { label: 'Низкие', value: 'low' },
            { label: 'Нулевые', value: 'zero' },
          ]}
        />
      </Space>
      <Table<WarehouseBalance>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        pagination={false}
        scroll={{ y: 'calc(100vh - 360px)' }}
        sticky
      />
    </Card>
  );
}
