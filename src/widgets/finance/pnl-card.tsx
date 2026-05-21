'use client';

import { Card, Col, Row, Skeleton, Statistic, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { usePnl } from '@entities/finance/hooks';
import { formatMoney, formatNumber } from '@shared/lib/format';

interface Props {
  from: string;
  to: string;
  projectId?: string;
}

export function PnlCard({ from, to, projectId }: Props) {
  const { data, isLoading } = usePnl({ from, to, projectId });

  if (isLoading || !data) return <Card><Skeleton active /></Card>;

  const isProfit = data.profit >= 0;

  return (
    <Card title="P&L за период">
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Statistic
            title="Доход"
            value={formatMoney(data.revenue)}
            prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
          />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="Материалы" value={formatMoney(data.materialsCost)} />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="Работы (ФОТ)" value={formatMoney(data.laborCost)} />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="Прочее" value={formatMoney(data.otherExpensesTotal)} />
        </Col>
        <Col xs={24} md={12}>
          <Statistic title="Все расходы" value={formatMoney(data.totalCost)} />
        </Col>
        <Col xs={24} md={12}>
          <Statistic
            title={`Прибыль (${formatNumber(data.margin)}%)`}
            value={formatMoney(data.profit)}
            valueStyle={{ color: isProfit ? '#3f8600' : '#cf1322' }}
            prefix={isProfit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          />
        </Col>
      </Row>
      {Object.keys(data.expensesByCategory).length > 0 && (
        <>
          <Typography.Title level={5} style={{ marginTop: 24 }}>
            Расходы по категориям
          </Typography.Title>
          <Row gutter={[16, 8]}>
            {Object.entries(data.expensesByCategory).map(([cat, amount]) => (
              <Col xs={12} md={6} key={cat}>
                <Statistic title={cat} value={formatMoney(amount)} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Card>
  );
}
