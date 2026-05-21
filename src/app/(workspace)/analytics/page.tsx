'use client';

import { Card, Col, Progress, Row, Skeleton, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { useCompanyOverview } from '@entities/analytics/hooks';
import type { ProjectKpi } from '@entities/analytics/types';
import { formatMoney, formatNumber } from '@shared/lib/format';

const kpiColumns: ColumnsType<ProjectKpi> = [
  {
    title: 'Объект',
    dataIndex: 'name',
    key: 'name',
    render: (_, r) => <Link href={`/projects/${r.id}`}>{r.name}</Link>,
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
    width: 140,
    render: (v: number) => (
      <strong style={{ color: v >= 0 ? '#3f8600' : '#cf1322' }}>{formatMoney(v)}</strong>
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

const laggingColumns: ColumnsType<ProjectKpi> = [
  {
    title: 'Объект',
    dataIndex: 'name',
    key: 'name',
    render: (_, r) => <Link href={`/projects/${r.id}`}>{r.name}</Link>,
  },
  {
    title: 'Дней до дедлайна',
    dataIndex: 'daysLeft',
    key: 'daysLeft',
    width: 180,
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

export default function AnalyticsPage() {
  const { data, isLoading } = useCompanyOverview();

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Аналитика" subtitle="Сводная картина по компании" />
      <PageContainer>
        <Card>
          <Skeleton active />
        </Card>
      </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Аналитика" subtitle="Сводная картина по компании за последние 30 дней" />
      <PageContainer>
        <Card title="KPI компании">
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Statistic title="Активных объектов" value={data.activeProjects} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="Завершено в этом месяце" value={data.completedThisMonth} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="Просрочено"
                value={data.overdueProjects}
                valueStyle={{ color: data.overdueProjects > 0 ? '#cf1322' : undefined }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="Средний прогресс"
                value={`${formatNumber(data.averageProgress)}%`}
              />
            </Col>
            <Col xs={12} md={8}>
              <Statistic title="Доход за 30 дней" value={formatMoney(data.totalRevenue30d)} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic title="Расходы за 30 дней" value={formatMoney(data.totalCost30d)} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic
                title="Прибыль за 30 дней"
                value={formatMoney(data.totalProfit30d)}
                valueStyle={{ color: data.totalProfit30d >= 0 ? '#3f8600' : '#cf1322' }}
              />
            </Col>
          </Row>
        </Card>

        <Card title="Топ-5 по прибыли">
          <Table<ProjectKpi>
            rowKey="id"
            size="small"
            columns={kpiColumns}
            dataSource={data.topProfit}
            pagination={false}
          />
        </Card>

        <Card title="Под угрозой срыва (≤ 14 дней до дедлайна)">
          <Table<ProjectKpi>
            rowKey="id"
            size="small"
            columns={laggingColumns}
            dataSource={data.topLagging}
            pagination={false}
            locale={{ emptyText: 'Нет объектов в зоне риска' }}
          />
        </Card>
      </PageContainer>
    </>
  );
}
