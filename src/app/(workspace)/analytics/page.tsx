'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  AlertOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import {
  AnalyticsPeriodPicker,
  computeAnalyticsPeriod,
  type AnalyticsRange,
} from '@shared/ui/analytics-period-picker';
import { useCompanyOverview } from '@entities/analytics/hooks';
import type {
  CompanyOverview,
  CriticalStockItem,
  ProjectKpi,
  ProjectRisk,
} from '@entities/analytics/types';
import { formatMoney, formatNumber } from '@shared/lib/format';

const SEVERITY_COLOR: Record<ProjectRisk['severity'], string> = {
  high: 'red',
  medium: 'orange',
  low: 'gold',
};

export default function CompanyAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsRange>(() => computeAnalyticsPeriod('30d'));
  const { data, isLoading } = useCompanyOverview({ from: period.from, to: period.to });

  return (
    <>
      <PageHeader
        title="Аналитика компании"
        subtitle="Сводка по всем объектам — финансы, прогресс, риски"
        breadcrumbs={[{ label: 'Аналитика' }]}
        filters={<AnalyticsPeriodPicker value={period} onChange={setPeriod} />}
      />
      <PageContainer>
        {isLoading || !data ? (
          <Skeleton active paragraph={{ rows: 12 }} />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <FinanceKpiStrip data={data} />
            <ProjectsKpiStrip data={data} />
            <Row gutter={[16, 16]}>
              <Col xs={24} xl={12}>
                <DebtsCard data={data} />
              </Col>
              <Col xs={24} xl={12}>
                <WarehouseCard data={data} />
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col xs={24} xl={12}>
                <TopProjectsCard
                  title="Топ объектов по прибыли"
                  icon={<RiseOutlined style={{ color: '#52c41a' }} />}
                  rows={data.topProfit}
                  metric="profit"
                />
              </Col>
              <Col xs={24} xl={12}>
                <TopProjectsCard
                  title="Топ объектов по расходам"
                  icon={<DollarOutlined style={{ color: '#fa541c' }} />}
                  rows={data.topCost}
                  metric="actualCost"
                />
              </Col>
            </Row>
            <RisksCard data={data} />
          </Space>
        )}
      </PageContainer>
    </>
  );
}

/* ============================================================ */

function FinanceKpiStrip({ data }: { data: CompanyOverview }) {
  const profitColor =
    data.finance.profit > 0
      ? 'var(--finance-income, #389e0d)'
      : data.finance.profit < 0
        ? 'var(--finance-expense, #cf1322)'
        : undefined;
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Доход за период"
            value={formatMoney(data.finance.revenue)}
            valueStyle={{ color: 'var(--finance-income, #389e0d)' }}
          />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Расход за период"
            value={formatMoney(data.finance.cost)}
            valueStyle={{ color: 'var(--finance-expense, #cf1322)' }}
          />
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
            По объектам: <strong>{formatMoney(data.finance.projectCost)}</strong>
            <br />
            Overhead: <strong>{formatMoney(data.finance.companyOverhead)}</strong>
          </div>
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Чистая прибыль"
            value={formatMoney(data.finance.profit)}
            valueStyle={{ color: profitColor }}
          />
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
            Маржа{' '}
            <strong style={{ color: profitColor }}>
              {formatNumber(data.finance.margin)}%
            </strong>
          </div>
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="ЗП выплачено бригадам"
            value={formatMoney(data.finance.payrollPaid)}
          />
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
            Авансы: <strong>{formatMoney(data.finance.advancesPaid)}</strong>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

function ProjectsKpiStrip({ data }: { data: CompanyOverview }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Активные объекты"
            value={data.projects.active}
            prefix={<ClockCircleOutlined style={{ color: '#1677ff' }} />}
          />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Завершено в этом месяце"
            value={data.projects.completed}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Просроченные"
            value={data.projects.overdue}
            valueStyle={{ color: data.projects.overdue > 0 ? '#cf1322' : undefined }}
            prefix={<WarningOutlined style={{ color: '#cf1322' }} />}
          />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
            Средний прогресс
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {formatNumber(data.projects.averageProgress)}%
          </div>
          <Progress
            percent={Math.round(data.projects.averageProgress)}
            showInfo={false}
            size="small"
          />
        </Card>
      </Col>
    </Row>
  );
}

function DebtsCard({ data }: { data: CompanyOverview }) {
  return (
    <Card title="Долговая позиция">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic
            title="Клиенты должны нам"
            value={formatMoney(data.debts.receivable)}
            valueStyle={{ color: data.debts.receivable > 0 ? '#fa8c16' : undefined }}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Мы должны (поставщики + ЗП)"
            value={formatMoney(data.debts.payable)}
            valueStyle={{ color: data.debts.payable > 0 ? '#fa541c' : undefined }}
          />
        </Col>
      </Row>
      <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
        Чистая позиция:{' '}
        <strong
          style={{
            color:
              data.debts.receivable - data.debts.payable >= 0
                ? 'var(--finance-income, #389e0d)'
                : 'var(--finance-expense, #cf1322)',
          }}
        >
          {formatMoney(data.debts.receivable - data.debts.payable)}
        </strong>
      </div>
    </Card>
  );
}

function WarehouseCard({ data }: { data: CompanyOverview }) {
  const critical = data.warehouse.criticalItems;
  return (
    <Card
      title="Склад"
      extra={
        critical.length > 0 && (
          <Tag color="red" icon={<AlertOutlined />}>
            {critical.length} критич.
          </Tag>
        )
      }
    >
      <Statistic
        title="Общая стоимость остатков"
        value={formatMoney(data.warehouse.totalValue)}
      />
      {critical.length > 0 ? (
        <>
          <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
            Материалы на пределе минимального остатка:
          </div>
          <Table<CriticalStockItem>
            rowKey="itemId"
            size="small"
            showHeader={false}
            pagination={false}
            dataSource={critical.slice(0, 5)}
            style={{ marginTop: 8 }}
            columns={[
              { title: 'Материал', dataIndex: 'name', ellipsis: true },
              {
                title: 'Остаток',
                key: 'qty',
                width: 140,
                align: 'right',
                render: (_, r) => (
                  <span>
                    <strong style={{ color: '#cf1322' }}>{formatNumber(r.qty)}</strong>
                    <span style={{ color: '#bfbfbf' }}>
                      {' '}/ {formatNumber(r.minQty)} {r.unit}
                    </span>
                  </span>
                ),
              },
            ]}
          />
        </>
      ) : (
        <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c' }}>
          Все материалы в пределах нормы 🟢
        </div>
      )}
    </Card>
  );
}

function TopProjectsCard({
  title,
  icon,
  rows,
  metric,
}: {
  title: string;
  icon: React.ReactNode;
  rows: ProjectKpi[];
  metric: 'profit' | 'actualCost';
}) {
  const columns: ColumnsType<ProjectKpi> = useMemo(
    () => [
      {
        title: 'Объект',
        key: 'name',
        render: (_, r) => (
          <Link href={`/objects/${r.id}`}>
            <strong>{r.name}</strong>
            <ArrowRightOutlined style={{ fontSize: 11, color: '#bfbfbf', marginLeft: 4 }} />
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              Прогресс {Math.round(r.progress)}% · Маржа {formatNumber(r.margin)}%
            </div>
          </Link>
        ),
      },
      {
        title: metric === 'profit' ? 'Прибыль' : 'Расход',
        dataIndex: metric,
        key: metric,
        align: 'right',
        width: 160,
        render: (v: number) => (
          <strong
            style={{
              color:
                metric === 'profit'
                  ? v >= 0
                    ? 'var(--finance-income, #389e0d)'
                    : 'var(--finance-expense, #cf1322)'
                  : 'var(--finance-expense, #cf1322)',
            }}
          >
            {formatMoney(v)}
          </strong>
        ),
      },
    ],
    [metric],
  );
  return (
    <Card title={<Space>{icon}<span>{title}</span></Space>}>
      {rows.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет данных" />
      ) : (
        <Table<ProjectKpi>
          rowKey="id"
          size="small"
          showHeader={false}
          pagination={false}
          columns={columns}
          dataSource={rows}
        />
      )}
    </Card>
  );
}

function RisksCard({ data }: { data: CompanyOverview }) {
  const risks = data.risks;
  if (risks.length === 0) {
    return (
      <Card title="Риски">
        <Alert type="success" showIcon message="Активных рисков не обнаружено" />
      </Card>
    );
  }
  return (
    <Card
      title={
        <Space>
          <WarningOutlined style={{ color: '#fa541c' }} />
          <span>Риски по объектам</span>
          <Tag color="red">{risks.length}</Tag>
        </Space>
      }
    >
      <Table<ProjectRisk>
        rowKey={(r) => `${r.projectId}-${r.kind}`}
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: false }}
        dataSource={risks}
        columns={[
          {
            title: 'Объект',
            key: 'project',
            render: (_, r) => (
              <Link href={`/objects/${r.projectId}`}>
                <strong>{r.projectName}</strong>
              </Link>
            ),
          },
          {
            title: 'Тяжесть',
            dataIndex: 'severity',
            width: 110,
            render: (s: ProjectRisk['severity']) => (
              <Tag color={SEVERITY_COLOR[s]}>
                {s === 'high' ? 'высокая' : s === 'medium' ? 'средняя' : 'низкая'}
              </Tag>
            ),
          },
          {
            title: 'Описание',
            dataIndex: 'message',
            ellipsis: true,
          },
        ]}
      />
    </Card>
  );
}
