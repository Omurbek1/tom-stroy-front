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
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import {
  useReleaseReservation,
  useReservations,
} from '@entities/warehouse-reservation/hooks';
import type {
  ReservationStatus,
  WarehouseReservation,
} from '@entities/warehouse-reservation/types';
import { message } from '@shared/lib/antd-static';
import { formatDate, formatNumber } from '@shared/lib/format';
import { CreateReservationDrawer } from '@features/create-reservation/ui/create-reservation-drawer';

const STATUS_META: Record<ReservationStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Активен', color: 'processing' },
  RELEASED: { label: 'Снят', color: 'default' },
  CONSUMED: { label: 'Использован', color: 'green' },
};

type FilterMode = 'active' | 'all' | ReservationStatus;

const FILTER_OPTIONS: Array<{ label: string; value: FilterMode }> = [
  { label: 'Активные', value: 'active' },
  { label: 'Снятые', value: 'RELEASED' },
  { label: 'Использованные', value: 'CONSUMED' },
  { label: 'История', value: 'all' },
];

export function ReservationsTable() {
  const [filter, setFilter] = useState<FilterMode>('active');
  const apiStatus =
    filter === 'active' || filter === 'all' ? undefined : (filter as ReservationStatus);
  const { data, isLoading } = useReservations({ status: apiStatus, limit: 100 });

  const release = useReleaseReservation();

  const rows = (data?.data ?? []).filter((r) =>
    filter === 'active' ? r.status === 'ACTIVE' : true,
  );

  const onRelease = (id: string) =>
    release.mutate(id, {
      onSuccess: () => message.success('Резерв снят'),
      onError: (err: unknown) => {
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        message.error(typeof detail === 'string' ? detail : 'Не удалось снять резерв');
      },
    });

  const columns: ColumnsType<WarehouseReservation> = [
    {
      title: '№',
      dataIndex: 'number',
      key: 'number',
      width: 140,
      render: (v: string | null, r) => (
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
            {v ?? r.id.slice(-6).toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
            {formatDate(r.createdAt)}
          </div>
        </div>
      ),
    },
    {
      title: 'Склад / Объект',
      key: 'where',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.warehouse?.name ?? '—'}</div>
          {r.project && (
            <div
              style={{
                fontSize: 12,
                color: 'var(--ant-color-text-secondary, #8c8c8c)',
              }}
            >
              для {r.project.name}
            </div>
          )}
        </div>
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
      width: 180,
      align: 'right',
      render: (_, r) => {
        const total = r.lines.reduce((s, l) => s + Number(l.qty), 0);
        return (
          <Tooltip
            title={r.lines
              .map(
                (l) =>
                  `${l.item?.name ?? l.itemId}: ${formatNumber(l.qty)} ${l.item?.unit ?? ''}`,
              )
              .join('\n')}
          >
            {formatNumber(total)} ед.
          </Tooltip>
        );
      },
    },
    {
      title: 'До',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 120,
      render: (v: string | null) => (v ? formatDate(v) : '—'),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (s: ReservationStatus) => (
        <Tag color={STATUS_META[s].color}>{STATUS_META[s].label}</Tag>
      ),
    },
    {
      title: 'Комментарий',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: '',
      key: 'actions',
      width: 140,
      render: (_, r) => {
        if (r.status !== 'ACTIVE') return null;
        return (
          <Popconfirm
            title="Снять резерв?"
            description="Остаток станет снова доступным."
            onConfirm={() => onRelease(r.id)}
            okText="Снять"
            cancelText="Нет"
          >
            <Button size="small" icon={<UnlockOutlined />} loading={release.isPending}>
              Снять
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <Space>
          <LockOutlined />
          <span>Резервы материалов</span>
        </Space>
      }
      extra={<CreateReservationDrawer />}
    >
      <Space style={{ marginBottom: 12 }}>
        <Segmented
          value={filter}
          onChange={(v) => setFilter(v as FilterMode)}
          options={FILTER_OPTIONS}
        />
      </Space>
      <Table<WarehouseReservation>
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
              rowKey={(l) => `${l.reservationId}-${l.itemId}`}
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
                  width: 160,
                  render: (_, l) => `${formatNumber(l.qty)} ${l.item?.unit ?? ''}`,
                },
              ]}
            />
          ),
        }}
      />
    </Card>
  );
}
