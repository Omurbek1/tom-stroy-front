'use client';

import {
  Button,
  Card,
  Popconfirm,
  Progress,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseOutlined,
  InboxOutlined,
  SendOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import {
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
  useMarkPurchaseOrderOrdered,
  usePurchaseOrders,
} from '@entities/purchase-order/hooks';
import type {
  PurchaseOrder,
  PurchaseStatus,
} from '@entities/purchase-order/types';
import { message } from '@shared/lib/antd-static';
import { formatDate, formatMoney, formatNumber } from '@shared/lib/format';
import { CreatePurchaseOrderDrawer } from '@features/create-purchase-order/ui/create-purchase-order-drawer';
import { ReceivePurchaseOrderDrawer } from '@features/receive-purchase-order/ui/receive-purchase-order-drawer';

const STATUS_META: Record<PurchaseStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Черновик', color: 'default' },
  APPROVED: { label: 'Согласовано', color: 'gold' },
  ORDERED: { label: 'Заказано', color: 'processing' },
  PARTIALLY_RECEIVED: { label: 'Частично', color: 'cyan' },
  RECEIVED: { label: 'Принято', color: 'green' },
  CANCELLED: { label: 'Отменено', color: 'red' },
};

type FilterMode = 'active' | 'all' | PurchaseStatus;

const FILTER_OPTIONS: Array<{ label: string; value: FilterMode }> = [
  { label: 'Активные', value: 'active' },
  { label: 'В работе', value: 'ORDERED' },
  { label: 'Черновики', value: 'DRAFT' },
  { label: 'История', value: 'all' },
];

function progressOf(o: PurchaseOrder): number {
  const total = o.items.reduce((s, l) => s + Number(l.qty), 0);
  if (total === 0) return 0;
  const received = o.items.reduce((s, l) => s + Number(l.qtyReceived), 0);
  return Math.round((received / total) * 100);
}

interface Props {
  /** When provided, list is scoped to this object's purchase orders only. */
  projectId?: string;
}

export function PurchaseOrdersTable({ projectId }: Props = {}) {
  const [filter, setFilter] = useState<FilterMode>('active');
  const [receiveTarget, setReceiveTarget] = useState<PurchaseOrder | null>(null);

  const apiStatus =
    filter === 'active' || filter === 'all' ? undefined : (filter as PurchaseStatus);
  const { data, isLoading } = usePurchaseOrders({ status: apiStatus, projectId, limit: 100 });

  const approve = useApprovePurchaseOrder();
  const markOrdered = useMarkPurchaseOrderOrdered();
  const cancel = useCancelPurchaseOrder();

  const rows = (data?.data ?? []).filter((o) =>
    filter === 'active'
      ? o.status !== 'RECEIVED' && o.status !== 'CANCELLED'
      : true,
  );

  const handle = (fn: Promise<unknown>, ok: string, err: string) =>
    fn
      .then(() => message.success(ok))
      .catch((e) => {
        const detail =
          (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        message.error(typeof detail === 'string' ? detail : err);
      });

  const columns: ColumnsType<PurchaseOrder> = [
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
      title: 'Поставщик',
      key: 'supplier',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.supplier?.name ?? '—'}</div>
          {r.warehouse && (
            <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
              → {r.warehouse.name}
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
      render: (_, r) => r.items.length,
    },
    {
      title: 'Сумма',
      dataIndex: 'total',
      key: 'total',
      width: 160,
      align: 'right',
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
    {
      title: 'Прогресс',
      key: 'progress',
      width: 160,
      render: (_, r) => {
        const pct = progressOf(r);
        if (r.status === 'DRAFT' || r.status === 'APPROVED' || r.status === 'CANCELLED')
          return null;
        return <Progress percent={pct} size="small" status={pct === 100 ? 'success' : 'active'} />;
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (s: PurchaseStatus) => (
        <Tag color={STATUS_META[s].color}>{STATUS_META[s].label}</Tag>
      ),
    },
    {
      title: 'Действие',
      key: 'actions',
      width: 220,
      render: (_, r) => {
        if (r.status === 'DRAFT') {
          return (
            <Space>
              <Tooltip title="Согласовать черновик">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() =>
                    handle(approve.mutateAsync(r.id), 'Согласовано', 'Не удалось согласовать')
                  }
                >
                  Согласовать
                </Button>
              </Tooltip>
              <Popconfirm
                title="Отменить заявку?"
                onConfirm={() =>
                  handle(cancel.mutateAsync(r.id), 'Отменено', 'Не удалось отменить')
                }
              >
                <Button size="small" danger icon={<CloseOutlined />} />
              </Popconfirm>
            </Space>
          );
        }
        if (r.status === 'APPROVED') {
          return (
            <Space>
              <Tooltip title="Отправить поставщику">
                <Button
                  size="small"
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() =>
                    handle(
                      markOrdered.mutateAsync(r.id),
                      'Заявка отмечена как заказанная',
                      'Не удалось',
                    )
                  }
                >
                  Заказать
                </Button>
              </Tooltip>
              <Popconfirm
                title="Отменить заявку?"
                onConfirm={() =>
                  handle(cancel.mutateAsync(r.id), 'Отменено', 'Не удалось отменить')
                }
              >
                <Button size="small" danger icon={<CloseOutlined />} />
              </Popconfirm>
            </Space>
          );
        }
        if (r.status === 'ORDERED' || r.status === 'PARTIALLY_RECEIVED') {
          return (
            <Button
              size="small"
              type="primary"
              icon={<InboxOutlined />}
              onClick={() => setReceiveTarget(r)}
            >
              Принять
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <>
      <Card
        title={
          <Space size={8}>
            <ShoppingOutlined />
            <span>Заявки на закуп</span>
          </Space>
        }
        extra={<CreatePurchaseOrderDrawer projectId={projectId} />}
      >
        <Space style={{ marginBottom: 12 }}>
          <Segmented
            value={filter}
            onChange={(v) => setFilter(v as FilterMode)}
            options={FILTER_OPTIONS}
          />
        </Space>
        <Table<PurchaseOrder>
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
                rowKey={(l) => l.id}
                dataSource={r.items}
                columns={[
                  {
                    title: 'Товар',
                    key: 'item',
                    render: (_, l) => l.item?.name ?? l.itemId,
                  },
                  {
                    title: 'Заказано',
                    key: 'qty',
                    align: 'right',
                    width: 140,
                    render: (_, l) => `${formatNumber(l.qty)} ${l.item?.unit ?? ''}`,
                  },
                  {
                    title: 'Принято',
                    key: 'qtyReceived',
                    align: 'right',
                    width: 140,
                    render: (_, l) => {
                      const left = Number(l.qty) - Number(l.qtyReceived);
                      const color = left > 0 ? '#d48806' : '#16a34a';
                      return (
                        <span style={{ color }}>
                          {formatNumber(l.qtyReceived)} {l.item?.unit ?? ''}
                        </span>
                      );
                    },
                  },
                  {
                    title: 'Цена',
                    dataIndex: 'unitCost',
                    key: 'unitCost',
                    align: 'right',
                    width: 140,
                    render: (v: number) => formatMoney(v),
                  },
                  {
                    title: 'Сумма',
                    dataIndex: 'total',
                    key: 'total',
                    align: 'right',
                    width: 160,
                    render: (v: number) => formatMoney(v),
                  },
                ]}
              />
            ),
          }}
        />
      </Card>
      <ReceivePurchaseOrderDrawer
        order={receiveTarget}
        open={!!receiveTarget}
        onClose={() => setReceiveTarget(null)}
      />
    </>
  );
}
