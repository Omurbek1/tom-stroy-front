'use client';

import {
  Button,
  Card,
  Progress,
  Segmented,
  Space,
  Table,
  Tag,
} from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useStockCounts } from '@entities/stock-count/hooks';
import type {
  StockCountListRow,
  StockCountStatus,
} from '@entities/stock-count/types';
import { formatDate } from '@shared/lib/format';
import { OpenStockCountModal } from '@features/open-stock-count/ui/open-stock-count-modal';
import { StockCountDrawer } from '@features/conduct-stock-count/ui/stock-count-drawer';

const STATUS_META: Record<StockCountStatus, { label: string; color: string }> = {
  IN_PROGRESS: { label: 'В процессе', color: 'processing' },
  PENDING_APPROVAL: { label: 'На утверждении', color: 'gold' },
  APPROVED: { label: 'Утверждено', color: 'green' },
  CANCELLED: { label: 'Отменено', color: 'default' },
};

type FilterMode = 'active' | 'all' | StockCountStatus;

const FILTER_OPTIONS: Array<{ label: string; value: FilterMode }> = [
  { label: 'Активные', value: 'active' },
  { label: 'На утверждении', value: 'PENDING_APPROVAL' },
  { label: 'История', value: 'all' },
];

export function StockCountsTable() {
  const [filter, setFilter] = useState<FilterMode>('active');
  const [activeId, setActiveId] = useState<string | null>(null);

  const queryStatus =
    filter === 'active' || filter === 'all' ? undefined : (filter as StockCountStatus);
  const { data, isLoading } = useStockCounts({ status: queryStatus, limit: 100 });

  const rows = (data?.data ?? []).filter((c) =>
    filter === 'active'
      ? c.status === 'IN_PROGRESS' || c.status === 'PENDING_APPROVAL'
      : true,
  );

  const columns: ColumnsType<StockCountListRow> = [
    {
      title: '№',
      dataIndex: 'number',
      key: 'number',
      width: 160,
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
      title: 'Склад',
      key: 'warehouse',
      render: (_, r) => r.warehouse?.name ?? '—',
    },
    {
      title: 'Позиций',
      key: 'lines',
      width: 120,
      align: 'right',
      render: (_, r) => r._count?.lines ?? 0,
    },
    {
      title: 'Этапы',
      key: 'timeline',
      width: 220,
      render: (_, r) => {
        const stages = [
          { label: 'Создано', done: true },
          { label: 'На утверждении', done: !!r.submittedAt },
          { label: 'Утверждено', done: !!r.approvedAt },
        ];
        const pct =
          (stages.filter((s) => s.done).length / stages.length) * 100;
        return (
          <Progress
            percent={pct}
            size="small"
            status={r.status === 'CANCELLED' ? 'exception' : 'active'}
            showInfo={false}
          />
        );
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (s: StockCountStatus) => (
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
      render: (_, r) => (
        <Button size="small" onClick={() => setActiveId(r.id)}>
          {r.status === 'IN_PROGRESS' ? 'Продолжить' : 'Открыть'}
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <Space>
            <AuditOutlined />
            <span>Инвентаризации</span>
          </Space>
        }
        extra={<OpenStockCountModal onOpened={(id) => setActiveId(id)} />}
      >
        <Space style={{ marginBottom: 12 }}>
          <Segmented
            value={filter}
            onChange={(v) => setFilter(v as FilterMode)}
            options={FILTER_OPTIONS}
          />
        </Space>
        <Table<StockCountListRow>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          pagination={false}
        />
      </Card>
      <StockCountDrawer
        countId={activeId}
        open={!!activeId}
        onClose={() => setActiveId(null)}
      />
    </>
  );
}
