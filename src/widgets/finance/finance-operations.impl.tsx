'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClockCircleOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useFinanceOperations } from '@entities/finance/hooks';
import type { FinanceDebtRow, FinanceOperations } from '@entities/finance/types';
import { formatDate, formatMoney } from '@shared/lib/format';
import { IssueAdvanceButton } from '@features/issue-advance/ui/issue-advance-button';
import { AddDebtButton } from '@features/add-debt/ui/add-debt-button';
import { DebtPaymentDrawer } from '@features/debt-payment/ui/debt-payment-drawer';
import type { DebtKind } from '@entities/debt/types';
import './object-finance/object-finance.css';

interface Props {
  from: string;
  to: string;
  projectId?: string;
}

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

interface AgingBucket {
  key: string;
  label: string;
  color: string;
  range: [number, number];
  amount: number;
  count: number;
}

function buildBuckets(rows: FinanceDebtRow[]): AgingBucket[] {
  const buckets: AgingBucket[] = [
    { key: '0-30', label: 'до 30 дней', color: '#52c41a', range: [0, 30], amount: 0, count: 0 },
    { key: '31-60', label: '31–60 дней', color: '#faad14', range: [31, 60], amount: 0, count: 0 },
    { key: '61-90', label: '61–90 дней', color: '#fa8c16', range: [61, 90], amount: 0, count: 0 },
    { key: '90+', label: 'более 90 дней', color: '#cf1322', range: [91, Infinity], amount: 0, count: 0 },
  ];
  const now = Date.now();
  for (const row of rows) {
    if (!row.since) {
      buckets[0].amount += row.amount;
      buckets[0].count += 1;
      continue;
    }
    const days = Math.max(0, Math.floor((now - +new Date(row.since)) / 86400000));
    const target = buckets.find((b) => days >= b.range[0] && days <= b.range[1]) ?? buckets[3];
    target.amount += row.amount;
    target.count += 1;
  }
  return buckets;
}

/** Russian plural form for "долг": 1 долг, 2 долга, 5 долгов. */
function pluralDebts(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} долг`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} долга`;
  return `${n} долгов`;
}

function ageDays(since?: string): number | null {
  if (!since) return null;
  return Math.max(0, Math.floor((Date.now() - +new Date(since)) / 86400000));
}

function ageColor(days: number | null): string {
  if (days == null) return 'default';
  if (days <= 30) return 'green';
  if (days <= 60) return 'gold';
  if (days <= 90) return 'orange';
  return 'red';
}

export function FinanceOperationsWidget({ from, to, projectId }: Props) {
  const { data, isLoading } = useFinanceOperations({ from, to, projectId });
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addKind, setAddKind] = useState<DebtKind>('PAYABLE');

  const openAdd = (kind: DebtKind) => {
    setAddKind(kind);
    setAddOpen(true);
  };

  const payableBuckets = useMemo(() => (data ? buildBuckets(data.payables) : []), [data]);
  const receivableBuckets = useMemo(
    () => (data ? buildBuckets(data.receivables) : []),
    [data],
  );

  if (isLoading || !data) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }

  const operationColumns: ColumnsType<OperationRow> = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Операция',
      key: 'type',
      width: 220,
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Tag color={TYPE_COLOR[row.type] ?? 'default'}>{row.label}</Tag>
          {row.note && (
            <span style={{ color: 'var(--ant-color-text-secondary, #8c8c8c)', fontSize: 12 }}>
              {row.note}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Кому / от кого',
      dataIndex: 'counterparty',
      key: 'counterparty',
      ellipsis: true,
    },
    {
      title: 'Объект',
      key: 'project',
      width: 180,
      render: (_, row) =>
        row.projectId ? <Link href={`/objects/${row.projectId}`}>{row.projectName}</Link> : '—',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (v: number, row) => (
        <strong
          style={{
            color:
              row.direction === 'in'
                ? 'var(--finance-income)'
                : row.direction === 'out'
                  ? 'var(--finance-expense)'
                  : undefined,
          }}
        >
          {row.direction === 'in' ? '+' : row.direction === 'out' ? '−' : ''}
          {formatMoney(v)}
        </strong>
      ),
    },
  ];

  const debtColumns = (
    direction: 'payable' | 'receivable',
  ): ColumnsType<FinanceDebtRow> => [
    {
      title: direction === 'payable' ? 'Кому мы должны' : 'Кто нам должен',
      dataIndex: 'counterparty',
      key: 'counterparty',
      ellipsis: true,
      render: (v: string, row) => (
        <Space size={6}>
          <span>{v}</span>
          {row.type === 'manual' && <Tag color="geekblue">Ручной</Tag>}
        </Space>
      ),
    },
    {
      title: 'Основание',
      dataIndex: 'basis',
      key: 'basis',
      width: 180,
    },
    {
      title: 'Возраст',
      key: 'age',
      width: 130,
      render: (_, row) => {
        const days = ageDays(row.since);
        if (days == null) return '—';
        return (
          <Tag color={ageColor(days)} icon={<ClockCircleOutlined />}>
            {days} дн.
          </Tag>
        );
      },
      sorter: (a, b) => (ageDays(a.since) ?? 0) - (ageDays(b.since) ?? 0),
    },
    {
      title: 'Объект',
      key: 'project',
      width: 180,
      render: (_, row) =>
        row.projectId ? <Link href={`/objects/${row.projectId}`}>{row.projectName}</Link> : '—',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      width: 160,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      defaultSortOrder: 'descend',
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
    {
      title: '',
      key: 'actions',
      width: 130,
      render: (_, row) =>
        row.debtId ? (
          <Space size={4}>
            <Button
              size="small"
              type="primary"
              icon={<WalletOutlined />}
              onClick={() => setPaymentDebtId(row.debtId ?? null)}
            >
              Оплата
            </Button>
            <Tooltip title="История оплат">
              <Button
                size="small"
                icon={<HistoryOutlined />}
                onClick={() => setPaymentDebtId(row.debtId ?? null)}
              />
            </Tooltip>
          </Space>
        ) : (
          <Tooltip title="Этот долг считается автоматически из закупок / зарплат / бюджета">
            <span style={{ color: '#bfbfbf', fontSize: 11 }}>авто</span>
          </Tooltip>
        ),
    },
  ];

  const payrollRows = data.operations.filter((row) =>
    ['salary', 'advance', 'payment', 'payroll-adjustment'].includes(row.type),
  );

  const operationsTable = (rows: OperationRow[]) => (
    <Card>
      <Table<OperationRow>
        rowKey="id"
        size="small"
        columns={operationColumns}
        dataSource={rows}
        pagination={{ pageSize: 12, showSizeChanger: false }}
        scroll={{ x: 900 }}
      />
    </Card>
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {data.projectScoped && (
        <Alert
          type="info"
          showIcon
          message="Зарплаты пока считаются на уровне компании"
          description="По объекту учтены: приходы, расходы, материалы, работы, техника, закупки. Привязка ЗП к объекту появится в следующем спринте."
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Приходы за период"
              value={formatMoney(data.summary.income)}
              valueStyle={{ color: 'var(--finance-income, #389e0d)' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Расходы за период"
              value={formatMoney(data.summary.expenses)}
              valueStyle={{ color: 'var(--finance-expense, #cf1322)' }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="ЗП выплачено" value={formatMoney(data.summary.payrollPaid)} />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              Авансы: <strong>{formatMoney(data.summary.advances)}</strong>
            </div>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Мы должны"
              value={formatMoney(data.summary.payable)}
              valueStyle={{ color: data.summary.payable > 0 ? '#fa541c' : undefined }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              Нам должны: <strong>{formatMoney(data.summary.receivable)}</strong>
            </div>
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="debts"
        items={[
          {
            key: 'debts',
            label: `Долги (${data.payables.length + data.receivables.length})`,
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className="finance-tab-actions">
                  <Button onClick={() => openAdd('RECEIVABLE')}>+ Нам должны</Button>
                  <Button type="primary" onClick={() => openAdd('PAYABLE')}>
                    + Мы должны
                  </Button>
                </div>
                <DebtsSection
                  title="Мы должны"
                  subtitle="Поставщики и сотрудники, которым мы не доплатили. Чем старше долг — тем хуже репутация."
                  rows={data.payables}
                  buckets={payableBuckets}
                  columns={debtColumns('payable')}
                  tone="payable"
                />
                <DebtsSection
                  title="Нам должны"
                  subtitle="Дебиторская задолженность по объектам = бюджет минус полученные платежи."
                  rows={data.receivables}
                  buckets={receivableBuckets}
                  columns={debtColumns('receivable')}
                  tone="receivable"
                />
              </Space>
            ),
          },
          {
            key: 'payroll',
            label: `Зарплата и авансы (${payrollRows.length})`,
            children: (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {projectId && (
                  <div className="finance-tab-actions">
                    <IssueAdvanceButton projectId={projectId} />
                  </div>
                )}
                {operationsTable(payrollRows)}
              </Space>
            ),
          },
          {
            key: 'operations',
            label: `Лента операций (${data.operations.length})`,
            children: operationsTable(data.operations),
          },
        ]}
      />

      <AddDebtButton
        projectId={projectId}
        defaultKind={addKind}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        hideTrigger
      />
      <DebtPaymentDrawer
        debtId={paymentDebtId}
        open={paymentDebtId !== null}
        onClose={() => setPaymentDebtId(null)}
      />
    </Space>
  );
}

function DebtsSection({
  title,
  subtitle,
  rows,
  buckets,
  columns,
  tone,
}: {
  title: string;
  subtitle: string;
  rows: FinanceDebtRow[];
  buckets: AgingBucket[];
  columns: ColumnsType<FinanceDebtRow>;
  tone: 'payable' | 'receivable';
}) {
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span>{title}</span>
          <Tag color={tone === 'payable' ? 'red' : 'orange'}>{rows.length} строк</Tag>
          <span style={{ color: 'var(--ant-color-text-tertiary, #8c8c8c)', fontSize: 13 }}>
            Итого:{' '}
            <strong
              style={{
                color: tone === 'payable' ? 'var(--finance-expense, #cf1322)' : '#fa8c16',
              }}
            >
              {formatMoney(total)}
            </strong>
          </span>
          <Tooltip title={subtitle}>
            <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
          </Tooltip>
        </div>
      }
    >
      {rows.length === 0 ? (
        <Empty
          description={
            tone === 'payable'
              ? 'Мы никому не должны за выбранный период'
              : 'Все клиенты рассчитались полностью'
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div className="aging-strip">
            {buckets.map((b) => {
              const empty = b.count === 0;
              return (
                <div
                  key={b.key}
                  className={`aging-cell${empty ? ' aging-cell--empty' : ''}`}
                  style={{ borderTopColor: empty ? 'transparent' : b.color }}
                >
                  <div className="aging-cell__label">{b.label}</div>
                  <div
                    className="aging-cell__value"
                    style={{ color: empty ? undefined : b.color }}
                  >
                    {empty ? '—' : formatMoney(b.amount)}
                  </div>
                  <div className="aging-cell__count">
                    {empty ? 'нет долгов' : pluralDebts(b.count)}
                  </div>
                </div>
              );
            })}
          </div>
          <Table<FinanceDebtRow>
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={rows}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 800 }}
          />
        </Space>
      )}
    </Card>
  );
}
