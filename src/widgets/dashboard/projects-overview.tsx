'use client';

import { Card, Col, Row, Skeleton } from 'antd';
import { useProjectsList } from '@entities/project/hooks';
import { StatCard } from '@shared/ui/stat-card';

export function ProjectsOverview() {
  const { data, isLoading } = useProjectsList({ limit: 200 });

  if (isLoading) return <Skeleton active />;

  const projects = data?.data ?? [];
  const active = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const atRisk = projects.filter((p) => p.status === 'AT_RISK' || p.status === 'LAGGING').length;
  const overdue = projects.filter((p) => p.status === 'OVERDUE').length;
  const completed = projects.filter((p) => p.status === 'COMPLETED').length;

  return (
    <Card title="Объекты">
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <StatCard title="В работе" value={active} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="В риске" value={atRisk} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Просрочены" value={overdue} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Завершены" value={completed} />
        </Col>
      </Row>
    </Card>
  );
}
