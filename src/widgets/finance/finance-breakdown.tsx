'use client';

import { Card, Col, Empty, Row, Skeleton, Space, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinanceBreakdown } from '@entities/finance/hooks';
import type { FinanceBreakdown } from '@entities/finance/types';
import { formatMoney, formatNumber } from '@shared/lib/format';

interface Props {
  from: string;
  to: string;
  projectId?: string;
}

const COLORS = [
  'var(--chart-materials)',
  'var(--chart-labor)',
  'var(--chart-equipment)',
  'var(--chart-other)',
  'var(--chart-revenue)',
];

type BrigadeRow = FinanceBreakdown['byBrigade'][number];
type MaterialRow = FinanceBreakdown['byMaterial'][number];

export function FinanceBreakdownWidget({ from, to, projectId }: Props) {
  const { data, isLoading } = useFinanceBreakdown({ from, to, projectId });

  if (isLoading || !data) {
    return (
      <Card>
        <Skeleton active />
      </Card>
    );
  }

  const brigadeColumns: ColumnsType<BrigadeRow> = [
    { title: 'Бригада', dataIndex: 'brigadeName', key: 'brigadeName' },
    {
      title: 'Работ',
      dataIndex: 'worksCount',
      key: 'worksCount',
      width: 90,
      align: 'right',
    },
    {
      title: 'Объём',
      dataIndex: 'volume',
      key: 'volume',
      width: 120,
      align: 'right',
      render: (v: number) => formatNumber(v),
    },
    {
      title: 'Работы',
      dataIndex: 'laborAmount',
      key: 'laborAmount',
      width: 150,
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Материалы',
      dataIndex: 'materialsAmount',
      key: 'materialsAmount',
      width: 150,
      align: 'right',
      render: (v: number) => (v > 0 ? formatMoney(v) : '—'),
    },
    {
      title: 'Итого',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      defaultSortOrder: 'descend',
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
  ];

  const materialColumns: ColumnsType<MaterialRow> = [
    { title: 'Материал / инструмент', dataIndex: 'itemName', key: 'itemName' },
    {
      title: 'Кол-во',
      key: 'qty',
      width: 140,
      align: 'right',
      render: (_, r) => `${formatNumber(r.qty)} ${r.unit}`,
    },
    {
      title: 'Операций',
      dataIndex: 'txns',
      key: 'txns',
      width: 110,
      align: 'right',
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

  const costTotal = data.costStructure.reduce((sum, item) => sum + item.amount, 0);
  const topBrigades = data.byBrigade.slice(0, 8);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card title="Структура расходов">
            {data.costStructure.length === 0 ? (
              <Empty description="Расходов за период нет" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div style={{ height: 320 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.costStructure}
                      dataKey="amount"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={112}
                      paddingAngle={3}
                    >
                      {data.costStructure.map((entry, index) => (
                        <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatMoney(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <Space wrap>
              {data.costStructure.map((item, index) => (
                <Tag key={item.key} color={index === 0 ? 'blue' : index === 1 ? 'green' : 'default'}>
                  {item.name}: {formatNumber(costTotal ? (item.amount / costTotal) * 100 : 0)}%
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card title="Затраты по бригадам">
            {topBrigades.length === 0 ? (
              <Empty description="Работ по бригадам нет" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div style={{ height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={topBrigades} layout="vertical" margin={{ left: 16, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis type="number" tickFormatter={(v) => formatMoney(Number(v))} />
                    <YAxis dataKey="brigadeName" type="category" width={120} />
                    <Tooltip formatter={(v: number) => formatMoney(v)} />
                    <Bar dataKey="laborAmount" name="Работы" stackId="cost" fill="var(--chart-labor)" />
                    <Bar
                      dataKey="materialsAmount"
                      name="Материалы"
                      stackId="cost"
                      fill="var(--chart-materials)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Материалы" value={formatMoney(data.summary.materialsCost)} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Работы бригад" value={formatMoney(data.summary.laborCost)} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Себестоимость" value={formatMoney(data.summary.totalCost)} />
          </Card>
        </Col>
      </Row>

      <Card title="По бригадам">
        <Table<BrigadeRow>
          rowKey={(r) => r.brigadeId ?? r.brigadeName}
          size="small"
          columns={brigadeColumns}
          dataSource={data.byBrigade}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Card title="По материалам и инструментам">
        <Table<MaterialRow>
          rowKey="itemId"
          size="small"
          columns={materialColumns}
          dataSource={data.byMaterial}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 760 }}
        />
      </Card>
    </Space>
  );
}
