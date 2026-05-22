'use client';

import { use, useMemo, useState } from 'react';
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
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  RiseOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import {
  AnalyticsPeriodPicker,
  computeAnalyticsPeriod,
  type AnalyticsRange,
} from '@shared/ui/analytics-period-picker';
import { useProject, useProjectAnalytics } from '@entities/project/hooks';
import { usePnl, useFinanceOperations } from '@entities/finance/hooks';
import type { FinanceOperations } from '@entities/finance/types';
import { formatDate, formatMoney, formatNumber } from '@shared/lib/format';

type OperationRow = FinanceOperations['operations'][number];

const TYPE_COLOR: Record<string, string> = {
  income: 'green',
  expense: 'red',
  material: 'orange',
  work: 'blue',
  vehicle: 'purple',
  purchase: 'gold',
  salary: 'cyan',
  advance: 'geekblue',
  payment: 'magenta',
};

export default function ObjectAnalyticsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project, isLoading: projLoading } = useProject(id);
  const [period, setPeriod] = useState<AnalyticsRange>(() =>
    computeAnalyticsPeriod('30d'),
  );

  const { data: pnl, isLoading: pnlLoading } = usePnl({
    from: period.from,
    to: period.to,
    projectId: id,
  });
  const { data: analytics, isLoading: anLoading } = useProjectAnalytics(id);
  const { data: ops, isLoading: opsLoading } = useFinanceOperations({
    from: period.from,
    to: period.to,
    projectId: id,
  });

  return (
    <>
      <PageHeader
        title="Аналитика объекта"
        subtitle="Полная сводка по объекту за выбранный период"
        breadcrumbs={[
          { href: '/analytics', label: 'Аналитика' },
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Аналитика' },
        ]}
        filters={
          <AnalyticsPeriodPicker
            value={period}
            onChange={setPeriod}
            earliest={project?.startDate ?? undefined}
          />
        }
      />
      <PageContainer>
        {projLoading || !project ? (
          <Skeleton active paragraph={{ rows: 12 }} />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <FinanceKpis
              loading={pnlLoading}
              revenue={pnl?.revenue ?? 0}
              cost={pnl?.totalCost ?? 0}
              profit={pnl?.profit ?? 0}
              margin={pnl?.margin ?? 0}
            />
            <ProgressBlock
              loading={anLoading}
              progress={analytics?.progress ?? 0}
              doneVolume={analytics?.doneVolume ?? 0}
              planVolume={analytics?.planVolume ?? 0}
              velocity7d={analytics?.velocity7d ?? 0}
              forecastDays={analytics?.forecastDays ?? null}
              deadline={project.deadline ?? null}
              budget={Number(project.budget)}
              budgetVariance={analytics?.budgetVariance ?? 0}
            />
            <CostBreakdown
              loading={pnlLoading}
              materials={pnl?.materialsCost ?? 0}
              labor={pnl?.laborCost ?? 0}
              equipment={pnl?.equipmentCost ?? 0}
              other={pnl?.otherExpensesTotal ?? 0}
            />
            <PayrollAndDebts loading={opsLoading} ops={ops} />
            <RisksList project={project} analytics={analytics} ops={ops} />
            <OperationsHistory loading={opsLoading} operations={ops?.operations ?? []} />
          </Space>
        )}
      </PageContainer>
    </>
  );
}

/* ============================================================ */

function FinanceKpis({
  loading,
  revenue,
  cost,
  profit,
  margin,
}: {
  loading: boolean;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}) {
  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }
  const profitColor =
    profit > 0
      ? 'var(--finance-income, #389e0d)'
      : profit < 0
        ? 'var(--finance-expense, #cf1322)'
        : undefined;
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Доход объекта"
            value={formatMoney(revenue)}
            valueStyle={{ color: 'var(--finance-income, #389e0d)' }}
            prefix={<ArrowUpOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Расходы объекта"
            value={formatMoney(cost)}
            valueStyle={{ color: 'var(--finance-expense, #cf1322)' }}
            prefix={<ArrowDownOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Прибыль объекта"
            value={formatMoney(profit)}
            valueStyle={{ color: profitColor }}
          />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card>
          <Statistic
            title="Маржа"
            value={`${formatNumber(margin)}%`}
            valueStyle={{ color: profitColor }}
            prefix={<RiseOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );
}

function ProgressBlock({
  loading,
  progress,
  doneVolume,
  planVolume,
  velocity7d,
  forecastDays,
  deadline,
  budget,
  budgetVariance,
}: {
  loading: boolean;
  progress: number;
  doneVolume: number;
  planVolume: number;
  velocity7d: number;
  forecastDays: number | null;
  deadline: string | null;
  budget: number;
  budgetVariance: number;
}) {
  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }
  const planDeviation =
    planVolume > 0 ? ((doneVolume - planVolume) / planVolume) * 100 : 0;
  const daysToDeadline = deadline
    ? Math.ceil((dayjs(deadline).valueOf() - Date.now()) / 86400000)
    : null;
  return (
    <Card title="Прогресс и сроки">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>Прогресс выполнения</span>
            <Progress
              percent={Math.min(100, Math.round(progress))}
              status={progress >= 100 ? 'success' : 'active'}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              {formatNumber(doneVolume)} из {formatNumber(planVolume)} — отклонение от
              плана:{' '}
              <strong
                style={{
                  color:
                    planDeviation >= 0
                      ? 'var(--finance-income, #389e0d)'
                      : 'var(--finance-expense, #cf1322)',
                }}
              >
                {planDeviation >= 0 ? '+' : ''}
                {formatNumber(planDeviation)}%
              </strong>
            </div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="Темп (7 дн.)"
            value={`${formatNumber(velocity7d)} /д`}
          />
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
            Прогноз:{' '}
            <strong>
              {forecastDays != null ? `${formatNumber(forecastDays)} дн.` : '—'}
            </strong>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="До дедлайна"
            value={
              daysToDeadline === null
                ? '—'
                : daysToDeadline < 0
                  ? `−${Math.abs(daysToDeadline)} дн.`
                  : `${daysToDeadline} дн.`
            }
            valueStyle={{
              color:
                daysToDeadline !== null && daysToDeadline < 0
                  ? '#cf1322'
                  : daysToDeadline !== null && daysToDeadline < 14
                    ? '#fa8c16'
                    : undefined,
            }}
            prefix={<CalendarOutlined />}
          />
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
            {deadline ? formatDate(deadline) : 'Не указан'}
          </div>
        </Col>
        <Col xs={24}>
          <Card
            size="small"
            style={{ background: 'var(--ant-color-fill-quaternary, #fafafa)' }}
          >
            <Row gutter={16}>
              <Col xs={12} md={8}>
                <Statistic title="Бюджет" value={formatMoney(budget)} />
              </Col>
              <Col xs={12} md={8}>
                <Statistic
                  title="Остаток бюджета"
                  value={formatMoney(budgetVariance)}
                  valueStyle={{
                    color:
                      budgetVariance >= 0
                        ? 'var(--finance-income, #389e0d)'
                        : 'var(--finance-expense, #cf1322)',
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}

function CostBreakdown({
  loading,
  materials,
  labor,
  equipment,
  other,
}: {
  loading: boolean;
  materials: number;
  labor: number;
  equipment: number;
  other: number;
}) {
  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    );
  }
  return (
    <Card title="Структура расходов за период">
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Statistic title="Материалы" value={formatMoney(materials)} />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="Зарплаты бригад" value={formatMoney(labor)} />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="Техника" value={formatMoney(equipment)} />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="Прочее" value={formatMoney(other)} />
        </Col>
      </Row>
    </Card>
  );
}

function PayrollAndDebts({
  loading,
  ops,
}: {
  loading: boolean;
  ops: FinanceOperations | undefined;
}) {
  if (loading || !ops) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }
  const payable = ops.payables.reduce((s, r) => s + r.amount, 0);
  const receivable = ops.receivables.reduce((s, r) => s + r.amount, 0);
  return (
    <Card title="Зарплаты и долги по объекту">
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Statistic title="ЗП выплачено" value={formatMoney(ops.summary.payrollPaid)} />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="Авансы" value={formatMoney(ops.summary.advances)} />
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="Мы должны"
            value={formatMoney(payable)}
            valueStyle={{ color: payable > 0 ? '#fa541c' : undefined }}
          />
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="Нам должны"
            value={formatMoney(receivable)}
            valueStyle={{ color: receivable > 0 ? '#fa8c16' : undefined }}
          />
        </Col>
      </Row>
    </Card>
  );
}

interface ProjectMin {
  id: string;
  name: string;
  budget: number;
  deadline?: string | null;
}

interface AnalyticsMin {
  progress: number;
  velocity7d: number;
  budgetVariance: number;
}

function RisksList({
  project,
  analytics,
  ops,
}: {
  project: ProjectMin;
  analytics: AnalyticsMin | undefined;
  ops: FinanceOperations | undefined;
}) {
  const risks: { severity: 'high' | 'medium' | 'low'; message: string }[] = [];
  if (project.deadline) {
    const days = Math.ceil((dayjs(project.deadline).valueOf() - Date.now()) / 86400000);
    if (days < 0 && (analytics?.progress ?? 0) < 100) {
      risks.push({
        severity: 'high',
        message: `Дедлайн прошёл ${Math.abs(days)} дн назад, выполнено ${Math.round(
          analytics?.progress ?? 0,
        )}%`,
      });
    } else if (days >= 0 && days < 14 && (analytics?.progress ?? 0) < 100) {
      risks.push({
        severity: 'medium',
        message: `До дедлайна ${days} дн, выполнено ${Math.round(analytics?.progress ?? 0)}%`,
      });
    }
  }
  if (analytics && analytics.budgetVariance < 0) {
    risks.push({
      severity: 'high',
      message: `Бюджет превышен на ${formatMoney(Math.abs(analytics.budgetVariance))}`,
    });
  }
  if (
    analytics &&
    analytics.velocity7d < 0.0001 &&
    analytics.progress > 0 &&
    analytics.progress < 100
  ) {
    risks.push({ severity: 'medium', message: 'Темп за 7 дней практически нулевой' });
  }
  if (ops) {
    const payable = ops.payables.reduce((s, r) => s + r.amount, 0);
    if (payable > 0) {
      risks.push({
        severity: 'low',
        message: `Открытая кредиторка на ${formatMoney(payable)}`,
      });
    }
  }

  if (risks.length === 0) {
    return (
      <Card title="Риски объекта">
        <Alert type="success" showIcon message="Активных рисков по объекту нет" />
      </Card>
    );
  }
  return (
    <Card
      title={
        <Space>
          <WarningOutlined style={{ color: '#fa541c' }} />
          <span>Риски объекта</span>
          <Tag color="red">{risks.length}</Tag>
        </Space>
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {risks.map((r, i) => (
          <Alert
            key={i}
            type={
              r.severity === 'high'
                ? 'error'
                : r.severity === 'medium'
                  ? 'warning'
                  : 'info'
            }
            showIcon
            message={r.message}
          />
        ))}
      </Space>
    </Card>
  );
}

function OperationsHistory({
  loading,
  operations,
}: {
  loading: boolean;
  operations: OperationRow[];
}) {
  const columns: ColumnsType<OperationRow> = useMemo(
    () => [
      {
        title: 'Дата',
        dataIndex: 'date',
        key: 'date',
        width: 110,
        render: (v: string) => formatDate(v),
      },
      {
        title: 'Тип',
        key: 'type',
        width: 160,
        render: (_, r) => <Tag color={TYPE_COLOR[r.type] ?? 'default'}>{r.label}</Tag>,
      },
      {
        title: 'Контрагент',
        dataIndex: 'counterparty',
        ellipsis: true,
      },
      {
        title: 'Сумма',
        dataIndex: 'amount',
        align: 'right',
        width: 160,
        render: (v: number, row) => (
          <strong
            style={{
              color:
                row.direction === 'in'
                  ? 'var(--finance-income, #389e0d)'
                  : row.direction === 'out'
                    ? 'var(--finance-expense, #cf1322)'
                    : undefined,
            }}
          >
            {row.direction === 'in' ? '+' : row.direction === 'out' ? '−' : ''}
            {formatMoney(v)}
          </strong>
        ),
      },
    ],
    [],
  );
  return (
    <Card title="История операций по объекту">
      {loading ? (
        <Skeleton active />
      ) : operations.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Операций за период нет" />
      ) : (
        <Table<OperationRow>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={operations}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          scroll={{ x: 720 }}
        />
      )}
    </Card>
  );
}
