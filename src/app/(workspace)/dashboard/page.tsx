'use client';

import { Card, Col, Progress, Row, Skeleton, Table, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { StatsCard } from '@shared/ui/stats-card';
import { InsightsList } from '@widgets/ai-insights/insights-list';
import { PnlCard } from '@widgets/finance/pnl-card';
import { FinanceTimeseriesChart } from '@widgets/finance/timeseries-chart';
import { WarehouseAnalytics } from '@widgets/warehouse/warehouse-analytics';
import { useCompanyOverview } from '@entities/analytics/hooks';
import type { ProjectKpi } from '@entities/analytics/types';
import { formatMoney, formatNumber } from '@shared/lib/format';
import { StatusBadge, type ProjectStatus } from '@shared/ui/status-badge';

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
    render: (s: string) => <StatusBadge status={s as ProjectStatus} />,
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

const VALID_TABS = ['overview', 'finance', 'warehouse'] as const;
type TabKey = (typeof VALID_TABS)[number];

export default function AnalyticsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const tabFromUrl = params.get('tab') as TabKey | null;
  const activeTab: TabKey =
    tabFromUrl && (VALID_TABS as readonly string[]).includes(tabFromUrl) ? tabFromUrl : 'overview';

  const handleTabChange = (key: string) => {
    const sp = new URLSearchParams(params.toString());
    if (key === 'overview') sp.delete('tab');
    else sp.set('tab', key);
    const query = sp.toString();
    router.replace(query ? `/dashboard?${query}` : '/dashboard', { scroll: false });
  };

  return (
    <>
      <PageHeader
        title="Аналитика"
        subtitle="Сводка по объектам, рискам, прогрессу, финансам и складу"
      />
      <PageContainer>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          destroyInactiveTabPane
          items={[
            { key: 'overview',  label: 'Обзор',   children: <OverviewTab /> },
            { key: 'finance',   label: 'Финансы', children: <FinanceTab /> },
            { key: 'warehouse', label: 'Склад',   children: <WarehouseAnalytics /> },
          ]}
        />
      </PageContainer>
    </>
  );
}

function OverviewTab() {
  const { data, isLoading } = useCompanyOverview();

  if (isLoading || !data) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }

  return (
    <>
      <InsightsList title="Активные риски и AI-инсайты" canScan />

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

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
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
  );
}

function FinanceTab() {
  const { from, to } = useMemo(
    () => ({
      from: dayjs().subtract(30, 'day').startOf('day').toISOString(),
      to: dayjs().endOf('day').toISOString(),
    }),
    [],
  );
  return (
    <>
      <PnlCard from={from} to={to} />
      <FinanceTimeseriesChart from={from} to={to} title="Финансовая динамика за 30 дней" />
    </>
  );
}
