'use client';

import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useInventoryTransactions } from '@entities/inventory-item/hooks';
import type { InventoryTransaction, InventoryTxnType } from '@entities/inventory-item/types';
import { formatDate, formatMoney, formatNumber } from '@shared/lib/format';

const TYPE_META: Record<InventoryTxnType, { label: string; color: string }> = {
  RECEIPT: { label: 'Приход', color: 'green' },
  WRITEOFF: { label: 'Расход', color: 'red' },
  TRANSFER: { label: 'Перемещение', color: 'blue' },
  RETURN: { label: 'Возврат', color: 'gold' },
  ADJUSTMENT: { label: 'Коррекция', color: 'default' },
};

const columns: ColumnsType<InventoryTransaction> = [
  {
    title: 'Дата',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120,
    render: (v: string) => formatDate(v),
  },
  {
    title: 'Тип',
    dataIndex: 'type',
    key: 'type',
    width: 130,
    render: (t: InventoryTxnType) => (
      <Tag color={TYPE_META[t]?.color}>{TYPE_META[t]?.label ?? t}</Tag>
    ),
  },
  { title: 'Товар', key: 'item', render: (_, r) => r.item?.name ?? '—' },
  { title: 'Объект', key: 'project', render: (_, r) => r.project?.name ?? '—' },
  {
    title: 'Кол-во',
    dataIndex: 'qty',
    key: 'qty',
    align: 'right',
    width: 120,
    render: (v: number, r) => `${formatNumber(v)} ${r.item?.unit ?? ''}`,
  },
  {
    title: 'Сумма',
    dataIndex: 'total',
    key: 'total',
    align: 'right',
    width: 140,
    render: (v: number) => formatMoney(v),
  },
];

export function TransactionsTable({ projectId }: { projectId?: string } = {}) {
  const { data, isLoading } = useInventoryTransactions({ projectId, limit: 100 });
  return (
    <Card title="Движение материалов">
      <Table<InventoryTransaction>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        pagination={false}
      />
    </Card>
  );
}
