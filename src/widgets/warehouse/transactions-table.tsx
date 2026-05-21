'use client';

import { Button, Card, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useInventoryTransactions,
  useReverseMovement,
} from '@entities/inventory-item/hooks';
import type {
  InventoryTransaction,
  InventoryTxnType,
  MovementType,
} from '@entities/inventory-item/types';
import { message } from '@shared/lib/antd-static';
import { formatDate, formatMoney, formatNumber } from '@shared/lib/format';

const LEGACY_TYPE_META: Record<InventoryTxnType, { label: string; color: string }> = {
  RECEIPT: { label: 'Приход', color: 'green' },
  WRITEOFF: { label: 'Расход', color: 'red' },
  TRANSFER: { label: 'Перемещение', color: 'blue' },
  RETURN: { label: 'Возврат', color: 'gold' },
  ADJUSTMENT: { label: 'Коррекция', color: 'default' },
};

const MOVEMENT_TYPE_META: Record<MovementType, { label: string; color: string }> = {
  INCOME: { label: 'Приход', color: 'green' },
  WRITE_OFF: { label: 'Расход', color: 'red' },
  TRANSFER_OUT: { label: 'Отправка', color: 'blue' },
  TRANSFER_IN: { label: 'Получение', color: 'cyan' },
  ADJUSTMENT_PLUS: { label: 'Излишек', color: 'gold' },
  ADJUSTMENT_MINUS: { label: 'Недостача', color: 'volcano' },
  RETURN: { label: 'Возврат', color: 'gold' },
  REVERSE: { label: 'Отмена', color: 'magenta' },
};

function rowMeta(r: InventoryTransaction) {
  if (r.movementType) return MOVEMENT_TYPE_META[r.movementType];
  return LEGACY_TYPE_META[r.type] ?? { label: r.type, color: 'default' };
}

export function TransactionsTable({ projectId }: { projectId?: string } = {}) {
  const { data, isLoading } = useInventoryTransactions({ projectId, limit: 100 });
  const reverse = useReverseMovement();

  const onReverse = (id: string) => {
    reverse.mutate(
      { id },
      {
        onSuccess: () => message.success('Движение отменено'),
        onError: (err: unknown) => {
          const detail =
            (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            'Не удалось отменить движение';
          message.error(typeof detail === 'string' ? detail : 'Не удалось отменить движение');
        },
      },
    );
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
      key: 'type',
      width: 130,
      render: (_, r) => {
        const m = rowMeta(r);
        return <Tag color={m.color}>{m.label}</Tag>;
      },
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
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, r) => {
        const isReverse = r.movementType === 'REVERSE';
        const alreadyReversed = !!r.reversesId;
        if (isReverse || alreadyReversed) {
          return (
            <Tooltip title={isReverse ? 'Это отмена' : 'Уже отменено'}>
              <Tag color="default" style={{ margin: 0 }}>
                <UndoOutlined />
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Popconfirm
            title="Отменить движение?"
            description="Создастся обратная операция, остаток восстановится."
            okText="Отменить"
            cancelText="Нет"
            onConfirm={() => onReverse(r.id)}
          >
            <Button size="small" icon={<UndoOutlined />} loading={reverse.isPending} />
          </Popconfirm>
        );
      },
    },
  ];

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
