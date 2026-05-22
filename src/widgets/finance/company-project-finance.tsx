'use client';

import Link from 'next/link';
import { Card, Col, Empty, Row, Skeleton, Space, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCompanyProjectFinance } from '@entities/finance/hooks';
import type { CompanyProjectFinance } from '@entities/finance/types';
import { formatMoney, formatNumber } from '@shared/lib/format';

interface Props {
  from: string;
  to: string;
}

type ProjectFinanceRow = CompanyProjectFinance['projects'][number];

export function CompanyProjectFinanceWidget({ from, to }: Props) {
  const { data, isLoading } = useCompanyProjectFinance({ from, to });

  if (isLoading || !data) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }

  const chartData = [...data.projects]
    .filter((p) => p.revenue > 0 || p.totalCost > 0)
    .sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit))
    .slice(0, 10);

  const profitableCount = data.projects.filter((p) => p.profit > 0).length;
  const lossCount = data.projects.filter((p) => p.profit < 0).length;

  const columns: ColumnsType<ProjectFinanceRow> = [
    {
      title: 'Объект',
      dataIndex: 'projectName',
      key: 'projectName',
      fixed: 'left',
      width: 220,
      render: (name: string, row) => (
        <Space direction="vertical" size={0}>
          <Link href={`/objects/${row.projectId}/finance`}>{name}</Link>
          <span style={{ color: 'var(--ant-color-text-secondary, #8c8c8c)', fontSize: 12 }}>
            {row.status}
          </span>
        </Space>
      ),
    },
    {
      title: 'Доход',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Расход',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.totalCost - b.totalCost,
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Прибыль',
      dataIndex: 'profit',
      key: 'profit',
      width: 150,
      align: 'right',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.profit - b.profit,
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
      width: 100,
      align: 'right',
      sorter: (a, b) => a.margin - b.margin,
      render: (v: number, row) =>
        row.revenue > 0 ? (
          <Tag color={v >= 0 ? 'green' : 'red'}>{formatNumber(v)}%</Tag>
        ) : (
          '—'
        ),
    },
    {
      title: 'Материалы',
      dataIndex: 'materialsCost',
      key: 'materialsCost',
      width: 140,
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Работы',
      dataIndex: 'laborCost',
      key: 'laborCost',
      width: 140,
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Техника',
      dataIndex: 'equipmentCost',
      key: 'equipmentCost',
      width: 130,
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Прочее',
      dataIndex: 'otherExpensesTotal',
      key: 'otherExpensesTotal',
      width: 130,
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Доход компании" value={formatMoney(data.totals.revenue)} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Расходы объектов" value={formatMoney(data.totals.totalCost)} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Прибыль объектов"
              value={formatMoney(data.totals.profit)}
              valueStyle={{
                color: data.totals.profit >= 0 ? 'var(--finance-income)' : 'var(--finance-expense)',
              }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="Маржа" value={`${formatNumber(data.totals.margin)}%`} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title="Какие объекты прибыльные, какие убыточные">
            {chartData.length === 0 ? (
              <Empty description="Нет финансовых операций за период" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div style={{ height: 360 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis type="number" tickFormatter={(v) => formatMoney(Number(v))} />
                    <YAxis dataKey="projectName" type="category" width={130} />
                    <Tooltip formatter={(v: number) => formatMoney(v)} />
                    <Bar dataKey="profit" name="Прибыль">
                      {chartData.map((row) => (
                        <Cell
                          key={row.projectId}
                          fill={row.profit >= 0 ? 'var(--finance-income)' : 'var(--finance-expense)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Сводка по объектам">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Statistic title="Всего объектов" value={data.projects.length} />
              <Statistic title="Прибыльных" value={profitableCount} valueStyle={{ color: 'var(--finance-income)' }} />
              <Statistic title="Убыточных" value={lossCount} valueStyle={{ color: 'var(--finance-expense)' }} />
              <Statistic title="Общие накладные" value={formatMoney(data.totals.companyOverhead)} />
              <Statistic
                title="После накладных"
                value={formatMoney(data.totals.profitAfterOverhead)}
                valueStyle={{
                  color:
                    data.totals.profitAfterOverhead >= 0
                      ? 'var(--finance-income)'
                      : 'var(--finance-expense)',
                }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Финансы по объектам">
        <Table<ProjectFinanceRow>
          rowKey="projectId"
          size="small"
          columns={columns}
          dataSource={data.projects}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 1320 }}
          summary={(rows) => {
            const totals = rows.reduce(
              (acc, row) => {
                acc.revenue += row.revenue;
                acc.totalCost += row.totalCost;
                acc.profit += row.profit;
                return acc;
              },
              { revenue: 0, totalCost: 0, profit: 0 },
            );
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <strong>Итого</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong>{formatMoney(totals.revenue)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <strong>{formatMoney(totals.totalCost)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <strong>{formatMoney(totals.profit)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>
    </Space>
  );
}
