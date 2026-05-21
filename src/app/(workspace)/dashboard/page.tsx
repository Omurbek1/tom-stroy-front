'use client';

import { Card, Col, Progress, Row, Skeleton, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useMemo } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { StatsCard } from '@shared/ui/stats-card';
import { InsightsList } from '@widgets/ai-insights/insights-list';
import { PnlCard } from '@widgets/finance/pnl-card';
import { FinanceTimeseriesChart } from '@widgets/finance/timeseries-chart';
import { useCompanyOverview } from '@entities/analytics/hooks';
import type { ProjectKpi } from '@entities/analytics/types';
import { formatMoney, formatNumber } from '@shared/lib/format';

const profitColumns: ColumnsType<ProjectKpi> = [
  {
    title: 'Объект',
    dataIndex: 'name',
    key: 'name',
    render: (_, r) => <Link href={`/objects/${r.id}`}>{r.name}</Link>,
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: (s: string) => <Tag>{s}</Tag>,
  },
  {
    title: 'Прогресс',
    dataIndex: 'progress',
    key: 'progress',
    width: 160,
    render: (v: number) => <Progress percent={Math.round(v)} size="small" />,
  },
  {
    title: 'Прибыль',
    dataIndex: 'profit',
    key: 'profit',
    align: 'right',
    width: 150,
    render: (v: number) => (
      <strong style={{ color: v >= 0 ? 'var(--finance-income)' : 'var(--finance-expense)' }}>
        {formatMoney(v)}
      </strong>
    ),
  },
  {
    title: 'Маржа',
    dataIndex: 'margin',
    key: 'margin',
    align: 'right',
    width: 90,
    render: (v: number) => `${formatNumber(v)}%`,
  },
];

const riskColumns: ColumnsType<ProjectKpi> = [
  {
    title: 'Объект',
    dataIndex: 'name',
    key: 'name',
    render: (_, r) => <Link href={`/objects/${r.id}`}>{r.name}</Link>,
  },
  {
    title: 'Дедлайн',
    dataIndex: 'daysLeft',
    key: 'daysLeft',
    width: 160,
    align: 'right',
    render: (v: number | null) => {
      if (v === null) return '—';
      if (v < 0) return <Tag color="red">Просрочен на {Math.abs(v)} д.</Tag>;
      if (v <= 3) return <Tag color="red">{v} д.</Tag>;
      if (v <= 14) return <Tag color="orange">{v} д.</Tag>;
      return `${v} д.`;
    },
  },
  {
    title: 'Прогресс',
    dataIndex: 'progress',
    key: 'progress',
    width: 160,
    render: (v: number) => <Progress percent={Math.round(v)} size="small" />,
  },
];

export default function DashboardPage() {
  const { data, isLoading } = useCompanyOverview();
  const { from, to } = useMemo(
    () => ({
      from: dayjs().subtract(30, 'day').startOf('day').toISOString(),
      to: dayjs().endOf('day').toISOString(),
    }),
    [],
  );

  return (
    <>
      <PageHeader
        title="Аналитика"
        subtitle="Сводка по объектам, рискам, прогрессу и финансам за последние 30 дней"
      />
      <PageContainer>
        <InsightsList title="Активные риски и AI-инсайты" canScan />

        {isLoading || !data ? (
          <Card>
            <Skeleton active />
          </Card>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={12} lg={6}>
                <StatsCard label="Активных объектов" value={data.activeProjects} />
              </Col>
              <Col xs={12} lg={6}>
                <StatsCard label="Завершено за месяц" value={data.completedThisMonth} tone="success" />
              </Col>
              <Col xs={12} lg={6}>
                <StatsCard
                  label="Просрочено"
                  value={data.overdueProjects}
                  tone={data.overdueProjects > 0 ? 'danger' : 'default'}
                />
              </Col>
              <Col xs={12} lg={6}>
                <StatsCard
                  label="Средний прогресс"
                  value={`${formatNumber(data.averageProgress)}%`}
                />
              </Col>
              <Col xs={24} lg={8}>
                <StatsCard
                  label="Доход 30 дней"
                  value={formatMoney(data.totalRevenue30d)}
                  tone="success"
                />
              </Col>
              <Col xs={24} lg={8}>
                <StatsCard
                  label="Расходы 30 дней"
                  value={formatMoney(data.totalCost30d)}
                  tone="danger"
                />
              </Col>
              <Col xs={24} lg={8}>
                <StatsCard
                  label="Прибыль 30 дней"
                  value={formatMoney(data.totalProfit30d)}
                  tone={data.totalProfit30d >= 0 ? 'success' : 'danger'}
                />
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} xl={14}>
                <Card title="Топ объектов по прибыли">
                  <Table<ProjectKpi>
                    rowKey="id"
                    size="small"
                    columns={profitColumns}
                    dataSource={data.topProfit}
                    pagination={false}
                    scroll={{ x: 760 }}
                  />
                </Card>
              </Col>
              <Col xs={24} xl={10}>
                <Card title="Риски по срокам">
                  <Table<ProjectKpi>
                    rowKey="id"
                    size="small"
                    columns={riskColumns}
                    dataSource={data.topLagging}
                    pagination={false}
                    locale={{ emptyText: 'Нет объектов в зоне риска' }}
                    scroll={{ x: 520 }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}

        <PnlCard from={from} to={to} />
        <FinanceTimeseriesChart from={from} to={to} title="Финансовая динамика за 30 дней" />
      </PageContainer>
    </>
  );
}
