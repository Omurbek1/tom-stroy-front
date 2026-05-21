'use client';

import { Card, Col, Row } from 'antd';
import { useProjectsList } from '@entities/project/hooks';
import { StatCard } from '@shared/ui/stat-card';
import { formatMoney } from '@shared/lib/format';

export function FinanceOverview() {
  const { data, isLoading } = useProjectsList({ limit: 200 });
  const projects = data?.data ?? [];

  const budgetSum = projects.reduce((acc, p) => acc + Number(p.budget ?? 0), 0);
  const costSum = projects.reduce((acc, p) => acc + Number(p.actualCost ?? 0), 0);
  const profit = budgetSum - costSum;

  return (
    <Card title="Финансы (по активным объектам)">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <StatCard title="Сумма бюджетов" value={formatMoney(budgetSum)} loading={isLoading} />
        </Col>
        <Col xs={24} md={8}>
          <StatCard title="Факт. расходы" value={formatMoney(costSum)} loading={isLoading} />
        </Col>
        <Col xs={24} md={8}>
          <StatCard title="Прибыль (план)" value={formatMoney(profit)} loading={isLoading} />
        </Col>
      </Row>
    </Card>
  );
}
