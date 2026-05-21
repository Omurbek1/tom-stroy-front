'use client';

import { Button, Card, Col, Progress, Row, Segmented, Space, Table, Tag, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';
import {
  useAbcAnalysis,
  useRefreshReports,
  useTurnover,
} from '@entities/warehouse-reports/hooks';
import type {
  AbcClass,
  AbcRow,
  TurnoverRow,
} from '@entities/warehouse-reports/types';
import { message } from '@shared/lib/antd-static';
import { formatMoney, formatNumber } from '@shared/lib/format';

const DAYS_OPTIONS = [
  { label: '7 дней', value: 7 },
  { label: '30 дней', value: 30 },
  { label: '90 дней', value: 90 },
];

const ABC_META: Record<AbcClass, { color: string; label: string; description: string }> = {
  A: { color: 'red', label: 'A', description: '80% оборота — критичны' },
  B: { color: 'gold', label: 'B', description: '15% оборота — средние' },
  C: { color: 'green', label: 'C', description: '5% оборота — мелочёвка' },
};

export function WarehouseAnalytics() {
  const [days, setDays] = useState(30);
  const turnover = useTurnover(days);
  const abc = useAbcAnalysis(days);
  const refresh = useRefreshReports();

  const top10 = useMemo(
    () => (turnover.data ?? []).slice(0, 10),
    [turnover.data],
  );

  const onRefresh = () => {
    refresh.mutate(undefined, {
      onSuccess: () => message.success('Кэш сброшен — данные обновятся при следующем запросе'),
      onError: () => message.error('Не удалось сбросить кэш'),
    });
  };

  const summary = abc.data?.summary;
  const totalA = summary?.a ?? 0;
  const totalB = summary?.b ?? 0;
  const totalC = summary?.c ?? 0;
  const totalAll = totalA + totalB + totalC;

  const topColumns: ColumnsType<TurnoverRow> = [
    {
      title: '#',
      key: 'rank',
      width: 50,
      render: (_, _r, idx) => <strong>{idx + 1}</strong>,
    },
    {
      title: 'Товар',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
            {r.warehouseName}
          </div>
        </div>
      ),
    },
    {
      title: 'Списано',
      dataIndex: 'writeOffQty',
      key: 'writeOffQty',
      width: 130,
      align: 'right',
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'Оборот',
      dataIndex: 'turnoverValue',
      key: 'turnoverValue',
      width: 160,
      align: 'right',
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
    {
      title: 'Остаток',
      dataIndex: 'currentQty',
      key: 'currentQty',
      width: 130,
      align: 'right',
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'Стоимость склада',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 160,
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
  ];

  const abcColumns: ColumnsType<AbcRow> = [
    {
      title: 'Класс',
      dataIndex: 'abcClass',
      key: 'abcClass',
      width: 80,
      filters: [
        { text: 'A', value: 'A' },
        { text: 'B', value: 'B' },
        { text: 'C', value: 'C' },
      ],
      onFilter: (value, record) => record.abcClass === value,
      render: (c: AbcClass) => <Tag color={ABC_META[c].color}>{c}</Tag>,
    },
    {
      title: 'Товар',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
            {r.warehouseName}
          </div>
        </div>
      ),
    },
    {
      title: 'Оборот',
      dataIndex: 'turnoverValue',
      key: 'turnoverValue',
      width: 160,
      align: 'right',
      sorter: (a, b) => a.turnoverValue - b.turnoverValue,
      defaultSortOrder: 'descend',
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Куммулятив',
      dataIndex: 'cumulativePct',
      key: 'cumulativePct',
      width: 140,
      render: (v: number) => (
        <Tooltip title={`${v.toFixed(1)}% всего оборота приходится на этот и все товары выше`}>
          <Progress
            percent={Math.min(100, Math.round(v))}
            size="small"
            showInfo
            strokeColor={
              v <= 80 ? ABC_META.A.color : v <= 95 ? ABC_META.B.color : ABC_META.C.color
            }
          />
        </Tooltip>
      ),
    },
  ];

  const isLoading = turnover.isLoading || abc.isLoading;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card
        size="small"
        title="Параметры периода"
        extra={
          <Button
            icon={<ReloadOutlined />}
            size="small"
            onClick={onRefresh}
            loading={refresh.isPending}
          >
            Обновить кэш
          </Button>
        }
      >
        <Space>
          <span style={{ color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
            Период анализа:
          </span>
          <Segmented
            value={days}
            onChange={(v) => setDays(v as number)}
            options={DAYS_OPTIONS}
          />
        </Space>
      </Card>

      <Row gutter={12}>
        {(['A', 'B', 'C'] as const).map((cls) => {
          const meta = ABC_META[cls];
          const count = cls === 'A' ? totalA : cls === 'B' ? totalB : totalC;
          const pct = totalAll > 0 ? (count / totalAll) * 100 : 0;
          return (
            <Col xs={24} md={8} key={cls}>
              <Card size="small">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Tag
                    color={meta.color}
                    style={{ fontSize: 20, padding: '4px 14px', margin: 0 }}
                  >
                    {meta.label}
                  </Tag>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{count}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--ant-color-text-secondary, #8c8c8c)',
                      }}
                    >
                      {meta.description}
                    </div>
                  </div>
                </div>
                <Progress
                  percent={Math.round(pct)}
                  size="small"
                  showInfo={false}
                  strokeColor={meta.color}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card title={`Топ-10 по обороту за ${days} дней`} loading={isLoading}>
        <Table<TurnoverRow>
          rowKey={(r) => `${r.warehouseId}:${r.itemId}`}
          size="small"
          columns={topColumns}
          dataSource={top10}
          pagination={false}
          locale={{ emptyText: 'Нет движений за период' }}
        />
      </Card>

      <Card title="ABC-анализ" loading={isLoading}>
        <Table<AbcRow>
          rowKey={(r) => `${r.warehouseId}:${r.itemId}`}
          size="small"
          columns={abcColumns}
          dataSource={abc.data?.rows ?? []}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          scroll={{ y: 480 }}
        />
      </Card>
    </Space>
  );
}
