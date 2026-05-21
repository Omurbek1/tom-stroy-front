'use client';

import {
  Alert,
  Button,
  Input,
  InputNumber,
  Popconfirm,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { formatNumber } from '@shared/lib/format';
import {
  useApproveStockCount,
  useCancelStockCount,
  useStockCount,
  useSubmitStockCount,
  useUpdateStockCountLines,
} from '@entities/stock-count/hooks';
import type { StockCountStatus } from '@entities/stock-count/types';

const STATUS_META: Record<StockCountStatus, { label: string; color: string }> = {
  IN_PROGRESS: { label: 'В процессе', color: 'processing' },
  PENDING_APPROVAL: { label: 'На утверждении', color: 'gold' },
  APPROVED: { label: 'Утверждено', color: 'green' },
  CANCELLED: { label: 'Отменено', color: 'default' },
};

type FilterMode = 'all' | 'uncounted' | 'variance';

const FILTER_OPTIONS: Array<{ label: string; value: FilterMode }> = [
  { label: 'Все', value: 'all' },
  { label: 'Не пересчитано', value: 'uncounted' },
  { label: 'Расхождения', value: 'variance' },
];

interface Props {
  countId: string | null;
  open: boolean;
  onClose: () => void;
}

interface LocalLine {
  itemId: string;
  countedQty: number | null;
  dirty: boolean;
}

export function StockCountDrawer({ countId, open, onClose }: Props) {
  const { data: count, isLoading } = useStockCount(open ? countId ?? undefined : undefined);
  const updateLines = useUpdateStockCountLines(countId ?? undefined);
  const submit = useSubmitStockCount();
  const approve = useApproveStockCount();
  const cancel = useCancelStockCount();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [local, setLocal] = useState<Record<string, LocalLine>>({});

  useEffect(() => {
    if (!count) return;
    setLocal({});
  }, [count?.id, count?.updatedAt]);

  const lines = useMemo(() => count?.lines ?? [], [count]);

  const merged = useMemo(() => {
    return lines.map((l) => {
      const edit = local[l.itemId];
      const countedQty = edit?.dirty ? edit.countedQty : l.countedQty;
      const variance =
        countedQty == null ? null : countedQty - Number(l.expectedQty);
      return { ...l, countedQty, variance };
    });
  }, [lines, local]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return merged.filter((r) => {
      if (q && !(r.item?.name ?? '').toLowerCase().includes(q)) return false;
      if (filter === 'uncounted' && r.countedQty != null) return false;
      if (filter === 'variance') {
        if (r.variance == null || r.variance === 0) return false;
      }
      return true;
    });
  }, [merged, search, filter]);

  const stats = useMemo(() => {
    const total = merged.length;
    const counted = merged.filter((r) => r.countedQty != null).length;
    const surplus = merged
      .filter((r) => r.variance != null && r.variance > 0)
      .reduce((s, r) => s + (r.variance ?? 0), 0);
    const shortage = merged
      .filter((r) => r.variance != null && r.variance < 0)
      .reduce((s, r) => s + Math.abs(r.variance ?? 0), 0);
    const varianceCount = merged.filter(
      (r) => r.variance != null && r.variance !== 0,
    ).length;
    return { total, counted, varianceCount, surplus, shortage };
  }, [merged]);

  const dirtyCount = Object.values(local).filter((l) => l.dirty).length;

  const onLineChange = (itemId: string, value: number | null) => {
    setLocal((prev) => ({
      ...prev,
      [itemId]: { itemId, countedQty: value, dirty: true },
    }));
  };

  const onSave = async () => {
    const dirty = Object.values(local).filter(
      (l) => l.dirty && l.countedQty != null,
    );
    if (dirty.length === 0) return;
    try {
      await updateLines.mutateAsync(
        dirty.map((l) => ({ itemId: l.itemId, countedQty: l.countedQty as number })),
      );
      message.success(`Сохранено: ${dirty.length}`);
      setLocal({});
    } catch (err) {
      message.error(extractDetail(err, 'Не удалось сохранить'));
    }
  };

  const onSubmit = async () => {
    if (!count) return;
    if (dirtyCount > 0) await onSave();
    try {
      await submit.mutateAsync(count.id);
      message.success('Отправлено на утверждение');
    } catch (err) {
      message.error(extractDetail(err, 'Не удалось отправить'));
    }
  };

  const onApprove = async () => {
    if (!count) return;
    try {
      await approve.mutateAsync(count.id);
      message.success('Инвентаризация утверждена — корректировки записаны');
      onClose();
    } catch (err) {
      message.error(extractDetail(err, 'Не удалось утвердить'));
    }
  };

  const onCancel = async () => {
    if (!count) return;
    try {
      await cancel.mutateAsync(count.id);
      message.success('Инвентаризация отменена');
      onClose();
    } catch (err) {
      message.error(extractDetail(err, 'Не удалось отменить'));
    }
  };

  const isEditable = count?.status === 'IN_PROGRESS';
  const isLocked = !count || !isEditable;

  const columns: ColumnsType<typeof merged[number]> = [
    {
      title: 'Товар',
      key: 'item',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.item?.name ?? '—'}</div>
          {r.item?.category && (
            <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
              {r.item.category}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ожидается',
      dataIndex: 'expectedQty',
      key: 'expected',
      width: 140,
      align: 'right',
      render: (v: number, r) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatNumber(v)} {r.item?.unit ?? ''}
        </span>
      ),
    },
    {
      title: 'По факту',
      key: 'counted',
      width: 180,
      render: (_, r) => (
        <InputNumber
          size="small"
          min={0}
          value={r.countedQty ?? undefined}
          onChange={(v) => onLineChange(r.itemId, v as number | null)}
          disabled={!isEditable}
          style={{ width: '100%' }}
          placeholder="—"
          addonAfter={r.item?.unit ?? undefined}
        />
      ),
    },
    {
      title: 'Расхождение',
      key: 'variance',
      width: 140,
      align: 'right',
      render: (_, r) => {
        if (r.variance == null) return <Tag>—</Tag>;
        if (r.variance === 0) return <Tag color="green">0</Tag>;
        const isPlus = r.variance > 0;
        return (
          <Tag color={isPlus ? 'gold' : 'red'} style={{ fontFamily: 'monospace' }}>
            {isPlus ? '+' : ''}
            {formatNumber(r.variance)}
          </Tag>
        );
      },
    },
  ];

  if (!countId) return null;

  return (
    <FormModal
      title={`Инвентаризация ${count?.number ?? ''}`}
      subtitle={count?.warehouse?.name ?? ''}
      badge={count ? <Tag color={STATUS_META[count.status].color}>{STATUS_META[count.status].label}</Tag> : undefined}
      open={open}
      onClose={onClose}
      width={920}
      dirty={dirtyCount > 0}
      onSubmit={dirtyCount > 0 && isEditable ? onSave : undefined}
      footer={
        count && (
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 12 }}>
            <Space size="small">
              {!isLocked && (
                <Tooltip title="Сохранить введённые количества">
                  <Button
                    icon={<SaveOutlined />}
                    onClick={onSave}
                    disabled={dirtyCount === 0}
                    loading={updateLines.isPending}
                  >
                    Сохранить
                  </Button>
                </Tooltip>
              )}
            </Space>
            <Space>
              {count.status === 'IN_PROGRESS' && (
                <>
                  <Popconfirm
                    title="Отменить инвентаризацию?"
                    onConfirm={onCancel}
                    okText="Да"
                    cancelText="Нет"
                  >
                    <Button danger icon={<CloseOutlined />}>
                      Отменить
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Отправить на утверждение?"
                    description="Незакрытые строки останутся без корректировки."
                    onConfirm={onSubmit}
                    okText="Отправить"
                    cancelText="Нет"
                  >
                    <Button type="primary" icon={<SendOutlined />} loading={submit.isPending}>
                      На утверждение
                    </Button>
                  </Popconfirm>
                </>
              )}
              {count.status === 'PENDING_APPROVAL' && (
                <>
                  <Popconfirm title="Отменить?" onConfirm={onCancel} okText="Да" cancelText="Нет">
                    <Button danger icon={<CloseOutlined />}>Отменить</Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Утвердить?"
                    description="Будут созданы корректировки баланса для строк с расхождением."
                    onConfirm={onApprove}
                    okText="Утвердить"
                    cancelText="Нет"
                  >
                    <Button type="primary" icon={<CheckCircleOutlined />} loading={approve.isPending}>
                      Утвердить
                    </Button>
                  </Popconfirm>
                </>
              )}
              <Button onClick={onClose}>Закрыть</Button>
            </Space>
          </div>
        )
      }
    >
      {count && (
        <div style={{ padding: 20 }}>
          <Space size="large" wrap style={{ marginBottom: 16 }}>
            <Statistic title="Пересчитано" value={`${stats.counted} / ${stats.total}`} />
            <Statistic title="Расхождений" value={stats.varianceCount} />
            <Statistic title="Излишек" value={formatNumber(stats.surplus)} />
            <Statistic title="Недостача" value={formatNumber(stats.shortage)} />
          </Space>

          {count.status === 'PENDING_APPROVAL' && (
            <Alert
              type="info"
              showIcon
              message="Ожидает утверждения. После утверждения будут созданы корректировки баланса."
              style={{ marginBottom: 12 }}
            />
          )}
          {count.status === 'APPROVED' && (
            <Alert
              type="success"
              showIcon
              message="Утверждено. Корректировки записаны как ADJUSTMENT-движения."
              style={{ marginBottom: 12 }}
            />
          )}

          <Space style={{ marginBottom: 12 }} wrap>
            <Input.Search
              placeholder="Поиск товара"
              allowClear
              onSearch={setSearch}
              onChange={(e) => !e.target.value && setSearch('')}
              style={{ width: 280 }}
            />
            <Segmented
              value={filter}
              onChange={(v) => setFilter(v as FilterMode)}
              options={FILTER_OPTIONS}
            />
            {dirtyCount > 0 && <Tag color="gold">Несохранённых строк: {dirtyCount}</Tag>}
          </Space>

          <Table
            rowKey={(r) => r.itemId}
            size="small"
            columns={columns}
            dataSource={filtered}
            pagination={false}
            loading={isLoading}
            scroll={{ y: 'calc(80vh - 360px)' }}
            sticky
          />
        </div>
      )}
    </FormModal>
  );
}

function extractDetail(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  return typeof detail === 'string' ? detail : fallback;
}
