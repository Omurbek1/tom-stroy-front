'use client';

import {
  Col,
  DatePicker,
  Empty,
  Row,
  Segmented,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
} from 'antd';
import { DetailModal } from '@shared/ui/detail-modal';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useBrigade, useBrigadeStats } from '@entities/brigade/hooks';
import type { BrigadeMember, BrigadeStats } from '@entities/brigade/types';
import { formatDate, formatMoney, formatNumber } from '@shared/lib/format';
import { formatWorkType } from '@shared/constants/work-type';
import { formatWorkUnit } from '@shared/constants/work-unit';

type Preset = 'month' | 'q' | 'year' | 'all' | 'custom';

const PRESETS: Array<{ label: string; value: Preset }> = [
  { label: 'Месяц', value: 'month' },
  { label: 'Квартал', value: 'q' },
  { label: 'Год', value: 'year' },
  { label: 'Всё время', value: 'all' },
];

function presetRange(p: Preset): [Dayjs, Dayjs] | null {
  const now = dayjs();
  const to = now.endOf('day');
  if (p === 'month') return [now.startOf('month'), to];
  if (p === 'q') {
    const qStartMonth = Math.floor(now.month() / 3) * 3;
    return [now.month(qStartMonth).startOf('month'), to];
  }
  if (p === 'year') return [now.startOf('year'), to];
  return null;
}

const memberColumns: ColumnsType<BrigadeMember> = [
  { title: 'Сотрудник', key: 'name', render: (_, r) => r.employee.fullName },
  {
    title: 'Должность',
    key: 'role',
    width: 160,
    render: (_, r) => <Tag>{r.employee.role}</Tag>,
  },
  {
    title: 'В бригаде с',
    dataIndex: 'joinedAt',
    key: 'joinedAt',
    width: 130,
    render: (v: string) => formatDate(v),
  },
];

interface Props {
  brigadeId: string | null;
  projectId?: string;
  open: boolean;
  onClose: () => void;
}

export function BrigadeDetailDrawer({ brigadeId, projectId, open, onClose }: Props) {
  const [preset, setPreset] = useState<Preset>('all');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  // Reset filters whenever the drawer opens for a different brigade.
  useEffect(() => {
    if (!open) return;
    setPreset('all');
    setRange(null);
  }, [open, brigadeId]);

  const period = useMemo(() => {
    const r = preset === 'custom' ? range : presetRange(preset);
    if (!r) return { from: undefined, to: undefined };
    return {
      from: r[0].startOf('day').toISOString(),
      to: r[1].endOf('day').toISOString(),
    };
  }, [preset, range]);

  const { data, isLoading } = useBrigade(open ? brigadeId ?? undefined : undefined);
  const { data: stats, isLoading: statsLoading } = useBrigadeStats(
    open ? brigadeId ?? undefined : undefined,
    { ...period, projectId },
  );

  return (
    <DetailModal
      title={data ? data.name : 'Бригада'}
      width={920}
      open={open}
      onClose={onClose}
    >
      {isLoading || !data ? (
        <Skeleton active />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Segmented
              value={preset}
              onChange={(v) => {
                const next = v as Preset;
                setPreset(next);
                if (next !== 'custom') setRange(null);
              }}
              options={PRESETS}
            />
            <DatePicker.RangePicker
              value={range ?? undefined}
              onChange={(v) => {
                if (v && v[0] && v[1]) {
                  setRange([v[0], v[1]]);
                  setPreset('custom');
                } else {
                  setRange(null);
                  setPreset('all');
                }
              }}
              format="DD.MM.YYYY"
              allowClear
              placeholder={['Период', 'до']}
            />
          </Space>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={6}>
              <Statistic
                title="Специализация"
                value={data.specialization ?? '—'}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Statistic
                title="Прораб"
                value={data.foreman?.fullName ?? '—'}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="В бригаде"
                value={stats?.membersCount ?? data._count?.members ?? 0}
                suffix="чел."
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="Работ выполнено"
                value={stats?.works.count ?? data._count?.works ?? 0}
              />
            </Col>
          </Row>

          {statsLoading ? (
            <Skeleton active />
          ) : stats ? (
            <Tabs
              defaultActiveKey="finance"
              items={[
                {
                  key: 'finance',
                  label: 'Финансы',
                  children: <FinanceTab stats={stats} />,
                },
                {
                  key: 'works',
                  label: `Работы (${stats.works.count})`,
                  children: <WorksTab stats={stats} />,
                },
                ...(!stats.isProjectScoped
                  ? [
                      {
                        key: 'stock',
                        label: `Склад бригады (${stats.stock.items.length})`,
                        children: <StockTab stats={stats} />,
                      },
                    ]
                  : []),
                {
                  key: 'members',
                  label: `Состав (${data.members.length})`,
                  children:
                    data.members.length === 0 ? (
                      <Empty description="Нет сотрудников в бригаде" />
                    ) : (
                      <Table<BrigadeMember>
                        rowKey="id"
                        size="small"
                        columns={memberColumns}
                        dataSource={data.members}
                        pagination={false}
                      />
                    ),
                },
              ]}
            />
          ) : null}
        </Space>
      )}
    </DetailModal>
  );
}

function FinanceTab({ stats }: { stats: BrigadeStats }) {
  const { finance } = stats;
  const tiles: Array<{ title: string; value: number; color?: string }> = [
    { title: 'Заработано', value: finance.earned, color: '#16a34a' },
    { title: 'Премии', value: finance.bonus },
    { title: 'Авансы', value: finance.advance, color: '#d48806' },
    { title: 'Штрафы', value: finance.fines, color: '#cf1322' },
    { title: 'Удержания', value: finance.deductions },
    { title: 'Выплачено', value: finance.paid },
  ];
  const balanceColor = finance.balance > 0 ? '#16a34a' : '#8c8c8c';

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={[12, 12]}>
        {tiles.map((t) => (
          <Col xs={12} md={8} key={t.title}>
            <Statistic
              title={t.title}
              value={formatMoney(t.value)}
              valueStyle={{ color: t.color }}
            />
          </Col>
        ))}
      </Row>
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--ant-color-fill-quaternary, #f4f6f8)',
          borderRadius: 10,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
            К выплате (начислено + премии − авансы − штрафы − удержания)
          </div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{formatMoney(finance.netToPay)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
            Остаток к выплате
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: balanceColor }}>
            {formatMoney(finance.balance)}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
        {stats.isProjectScoped
          ? 'Показаны только работы этого объекта. Выплаты по объекту появятся после привязки платежей к объекту или работам.'
          : 'Цифры собираются из расчёток (Payroll) текущих участников бригады. Бывшие участники не учитываются.'}
      </div>
    </Space>
  );
}

function WorksTab({ stats }: { stats: BrigadeStats }) {
  const { works } = stats;
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Statistic title="Всего работ" value={works.count} />
        </Col>
        <Col xs={12} md={8}>
          <Statistic
            title="Сумма работ"
            value={formatMoney(works.totalAmount)}
            valueStyle={{ color: '#16a34a' }}
          />
        </Col>
        <Col xs={12} md={8}>
          <Statistic title="Объём" value={formatNumber(works.totalVolume)} />
        </Col>
      </Row>

      {works.byProject.length > 0 && (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>По объектам</div>
          <Table
            rowKey="projectId"
            size="small"
            pagination={false}
            dataSource={works.byProject}
            columns={[
              { title: 'Объект', dataIndex: 'projectName', key: 'projectName' },
              {
                title: 'Сумма',
                dataIndex: 'amount',
                key: 'amount',
                align: 'right',
                width: 180,
                render: (v: number) => <strong>{formatMoney(v)}</strong>,
              },
            ]}
          />
        </div>
      )}

      <div>
        <div style={{ fontWeight: 500, marginBottom: 8 }}>Последние работы</div>
        {works.recent.length === 0 ? (
          <Empty description="Работ пока нет" />
        ) : (
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={works.recent}
            scroll={{ y: 360 }}
            columns={[
              {
                title: 'Дата',
                dataIndex: 'date',
                key: 'date',
                width: 110,
                render: (v: string) => formatDate(v),
              },
              {
                title: 'Объект',
                dataIndex: 'projectName',
                key: 'projectName',
                ellipsis: true,
              },
              {
                title: 'Тип',
                dataIndex: 'workType',
                key: 'workType',
                width: 160,
                render: (v: string) => formatWorkType(v),
              },
              {
                title: 'Объём',
                key: 'volume',
                width: 130,
                align: 'right',
                render: (_, r) => `${formatNumber(r.volume)} ${formatWorkUnit(r.unit)}`,
              },
              {
                title: 'Цена',
                dataIndex: 'price',
                key: 'price',
                width: 110,
                align: 'right',
                render: (v: number) => formatMoney(v),
              },
              {
                title: 'Сумма',
                dataIndex: 'amount',
                key: 'amount',
                width: 130,
                align: 'right',
                render: (v: number) => <strong>{formatMoney(v)}</strong>,
              },
              {
                title: 'Исполнитель',
                dataIndex: 'employeeName',
                key: 'employeeName',
                width: 180,
                render: (v: string | null) => v ?? '—',
              },
            ]}
          />
        )}
      </div>
    </Space>
  );
}

function StockTab({ stats }: { stats: BrigadeStats }) {
  const { stock } = stats;
  if (stock.items.length === 0) {
    return <Empty description="На складе бригады материалов нет" />;
  }
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Statistic title="Стоимость на руках" value={formatMoney(stock.totalValue)} />
      <Table
        rowKey="itemId"
        size="small"
        pagination={false}
        dataSource={stock.items}
        scroll={{ y: 380 }}
        columns={[
          { title: 'Материал', dataIndex: 'itemName', key: 'itemName' },
          {
            title: 'Остаток',
            key: 'qty',
            align: 'right',
            width: 130,
            render: (_, r) => `${formatNumber(r.qty)} ${r.unit}`,
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
            key: 'available',
            align: 'right',
            width: 130,
            render: (_, r) => (
              <strong>
                {formatNumber(r.available)} {r.unit}
              </strong>
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
            width: 140,
            render: (v: number) => <strong>{formatMoney(v)}</strong>,
          },
        ]}
      />
    </Space>
  );
}
