'use client';

import {
  Button,
  Card,
  Popconfirm,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import {
  useCancelTransfer,
  useReceiveTransfer,
  useShipTransfer,
  useTransfers,
} from '@entities/warehouse-transfer/hooks';
import type {
  TransferStatus,
  WarehouseTransfer,
} from '@entities/warehouse-transfer/types';
import { message } from '@shared/lib/antd-static';
import { formatDate, formatNumber } from '@shared/lib/format';
import { CreateTransferDrawer } from '@features/create-warehouse-transfer/ui/create-transfer-drawer';

const STATUS_META: Record<TransferStatus, { label: string; color: string }> = {
  PENDING: { label: 'Подготовлено', color: 'gold' },
  SHIPPED: { label: 'В пути', color: 'processing' },
  RECEIVED: { label: 'Получено', color: 'green' },
  CANCELLED: { label: 'Отменено', color: 'default' },
};

type FilterMode = 'active' | 'all' | TransferStatus;

const FILTER_OPTIONS: Array<{ label: string; value: FilterMode }> = [
  { label: 'Активные', value: 'active' },
  { label: 'В пути', value: 'SHIPPED' },
  { label: 'Подготовлено', value: 'PENDING' },
  { label: 'История', value: 'all' },
];

export function TransfersTable() {
  const [filter, setFilter] = useState<FilterMode>('active');
  const queryStatus =
    filter === 'active' || filter === 'all' ? undefined : (filter as TransferStatus);
  const { data, isLoading } = useTransfers({ status: queryStatus, limit: 100 });

  const ship = useShipTransfer();
  const receive = useReceiveTransfer();
  const cancel = useCancelTransfer();

  const rows = (data?.data ?? []).filter((t) =>
    filter === 'active'
      ? t.status === 'PENDING' || t.status === 'SHIPPED'
      : true,
  );

  const onShip = (id: string) =>
    ship.mutate(id, {
      onSuccess: () => message.success('Отправлено со склада'),
      onError: (err: unknown) => message.error(extractDetail(err, 'Не удалось отправить')),
    });

  const onReceive = (id: string) =>
    receive.mutate(id, {
      onSuccess: () => message.success('Принято'),
      onError: (err: unknown) => message.error(extractDetail(err, 'Не удалось принять')),
    });

  const onCancel = (id: string) =>
    cancel.mutate(id, {
      onSuccess: () => message.success('Перемещение отменено'),
      onError: (err: unknown) => message.error(extractDetail(err, 'Не удалось отменить')),
    });

  const columns: ColumnsType<WarehouseTransfer> = [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Маршрут',
      key: 'route',
      render: (_, r) => (
        <Space size={6} style={{ flexWrap: 'wrap' }}>
          <strong>{r.fromWarehouse?.name ?? '—'}</strong>
          <ArrowRightOutlined style={{ color: '#8c8c8c' }} />
          <strong>{r.toWarehouse?.name ?? '—'}</strong>
        </Space>
      ),
    },
    {
      title: 'Позиций',
      key: 'lines',
      width: 100,
      align: 'right',
      render: (_, r) => r.lines.length,
    },
    {
      title: 'Объём',
      key: 'qty',
      width: 160,
      align: 'right',
      render: (_, r) => {
        const total = r.lines.reduce((s, l) => s + Number(l.qty), 0);
        return (
          <Tooltip
            title={r.lines
              .map((l) => `${l.item?.name ?? l.itemId}: ${formatNumber(l.qty)} ${l.item?.unit ?? ''}`)
              .join('\n')}
          >
            {formatNumber(total)} ед.
          </Tooltip>
        );
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (s: TransferStatus) => (
        <Tag color={STATUS_META[s].color}>{STATUS_META[s].label}</Tag>
      ),
    },
    {
      title: 'Действие',
      key: 'actions',
      width: 220,
      render: (_, r) => {
        if (r.status === 'PENDING') {
          return (
            <Space>
              <Popconfirm
                title="Отправить со склада?"
                description="Будут списаны материалы с источника."
                okText="Отправить"
                cancelText="Нет"
                onConfirm={() => onShip(r.id)}
              >
                <Button size="small" icon={<SendOutlined />} type="primary">
                  Отправить
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Отменить?"
                okText="Да"
                cancelText="Нет"
                onConfirm={() => onCancel(r.id)}
              >
                <Button size="small" icon={<CloseOutlined />} danger />
              </Popconfirm>
            </Space>
          );
        }
        if (r.status === 'SHIPPED') {
          return (
            <Popconfirm
              title="Принять на склад?"
              description="Материалы будут зачислены на приёмник."
              okText="Принять"
              cancelText="Нет"
              onConfirm={() => onReceive(r.id)}
            >
              <Button size="small" icon={<CheckOutlined />} type="primary">
                Принять
              </Button>
            </Popconfirm>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Card
      title="Перемещения между складами"
      extra={<CreateTransferDrawer />}
    >
      <Space style={{ marginBottom: 12 }}>
        <Segmented
          value={filter}
          onChange={(v) => setFilter(v as FilterMode)}
          options={FILTER_OPTIONS}
        />
      </Space>
      <Table<WarehouseTransfer>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        pagination={false}
        expandable={{
          expandedRowRender: (r) => (
            <Table
              size="small"
              pagination={false}
              rowKey={(l) => `${l.transferId}-${l.itemId}`}
              dataSource={r.lines}
              columns={[
                {
                  title: 'Товар',
                  key: 'item',
                  render: (_, l) => l.item?.name ?? l.itemId,
                },
                {
                  title: 'Кол-во',
                  key: 'qty',
                  align: 'right',
                  width: 140,
                  render: (_, l) => `${formatNumber(l.qty)} ${l.item?.unit ?? ''}`,
                },
                {
                  title: 'Цена (при отгрузке)',
                  dataIndex: 'unitCost',
                  key: 'unitCost',
                  align: 'right',
                  width: 180,
                  render: (v: number) => (v > 0 ? formatNumber(v) : '—'),
                },
              ]}
            />
          ),
        }}
      />
    </Card>
  );
}

function extractDetail(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  return typeof detail === 'string' ? detail : fallback;
}
