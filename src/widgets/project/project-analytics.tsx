'use client';

import { Card, Col, Progress, Row, Skeleton, Typography } from 'antd';
import { useProjectAnalytics } from '@entities/project/hooks';
import { StatCard } from '@shared/ui/stat-card';
import { formatMoney, formatNumber } from '@shared/lib/format';

export function ProjectAnalyticsBlock({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectAnalytics(projectId);

  if (isLoading || !data) return <Skeleton active />;

  return (
    <Card title="Аналитика">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Typography.Text type="secondary">Прогресс</Typography.Text>
          <Progress
            percent={Math.round(data.progress)}
            status={data.progress >= 100 ? 'success' : 'active'}
          />
          <Typography.Text type="secondary">
            {formatNumber(data.doneVolume)} / {formatNumber(data.planVolume)}
          </Typography.Text>
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Скорость (7 дн.)" value={formatNumber(data.velocity7d)} suffix="/д" />
        </Col>
        <Col xs={12} md={8}>
          <StatCard
            title="Прогноз завершения"
            value={data.forecastDays != null ? `${formatNumber(data.forecastDays)} дн.` : '—'}
          />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Материалы" value={formatMoney(data.materialsCost)} />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Зарплаты (работы)" value={formatMoney(data.laborCost)} />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Бюджет" value={formatMoney(data.budget)} />
        </Col>
        <Col xs={12} md={12}>
          <StatCard title="Факт. расходы" value={formatMoney(data.actualCost)} />
        </Col>
        <Col xs={12} md={12}>
          <StatCard
            title={`Прибыль (${formatNumber(data.margin)}%)`}
            value={formatMoney(data.profit)}
          />
        </Col>
      </Row>
    </Card>
  );
}
