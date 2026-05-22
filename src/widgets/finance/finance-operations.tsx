'use client';

import Link from 'next/link';
import { Alert, Card, Col, Row, Skeleton, Space, Statistic, Table, Tag, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useFinanceOperations } from '@entities/finance/hooks';
import type { FinanceDebtRow, FinanceOperations } from '@entities/finance/types';
import { formatDate, formatMoney } from '@shared/lib/format';

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

export function FinanceOperationsWidget({ from, to, projectId }: Props) {
  const { data, isLoading } = useFinanceOperations({ from, to, projectId });

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
      width: 210,
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
          {row.direction === 'in' ? '+' : row.direction === 'out' ? '-' : ''}
          {formatMoney(v)}
        </strong>
      ),
    },
  ];

  const debtColumns: ColumnsType<FinanceDebtRow> = [
    {
      title: 'Контрагент',
      dataIndex: 'counterparty',
      key: 'counterparty',
      ellipsis: true,
    },
    {
      title: 'Основание',
      dataIndex: 'basis',
      key: 'basis',
      width: 180,
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
      sorter: (a, b) => a.amount - b.amount,
      defaultSortOrder: 'descend',
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
  ];
  const incomeRows = data.operations.filter((row) => row.type === 'income');
  const expenseRows = data.operations.filter((row) =>
    ['expense', 'material', 'work', 'vehicle', 'purchase'].includes(row.type),
  );
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
        scroll={{ x: 860 }}
      />
    </Card>
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {data.projectScoped && (
        <Alert
          type="info"
          showIcon
          message="Зарплатные выплаты и авансы пока не привязаны к объекту"
          description="В объекте показаны точные приходы, расходы, материалы, работы, техника и закупки. Точные выплаты по объекту появятся после добавления projectId/projectWorkId в payroll."
        />
      )}
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Приходы" value={formatMoney(data.summary.income)} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Расходы" value={formatMoney(data.summary.expenses)} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Выплачено ЗП" value={formatMoney(data.summary.payrollPaid)} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Авансы" value={formatMoney(data.summary.advances)} />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="income"
        items={[
          {
            key: 'income',
            label: `Поступления от клиентов (${incomeRows.length})`,
            children: operationsTable(incomeRows),
          },
          {
            key: 'expenses',
            label: `Расходы (${expenseRows.length})`,
            children: operationsTable(expenseRows),
          },
          {
            key: 'payroll',
            label: `Выплаты и ЗП (${payrollRows.length})`,
            children: operationsTable(payrollRows),
          },
          {
            key: 'debts',
            label: `Долги / должники (${data.payables.length + data.receivables.length})`,
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card title={`Мы должны (${data.payables.length})`}>
                  <Table<FinanceDebtRow>
                    rowKey="id"
                    size="small"
                    columns={debtColumns}
                    dataSource={data.payables}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    scroll={{ x: 680 }}
                  />
                </Card>
                <Card title={`Нам должны (${data.receivables.length})`}>
                  <Table<FinanceDebtRow>
                    rowKey="id"
                    size="small"
                    columns={debtColumns}
                    dataSource={data.receivables}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    scroll={{ x: 680 }}
                  />
                </Card>
              </Space>
            ),
          },
          {
            key: 'operations',
            label: `Все операции (${data.operations.length})`,
            children: operationsTable(data.operations),
          },
        ]}
      />
    </Space>
  );
}
