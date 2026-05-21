'use client';

import { use } from 'react';
import { Card, Descriptions, Skeleton, Space, Tabs } from 'antd';
import { PageHeader } from '@shared/ui/page-header';
import { StatusBadge, ProjectStatus } from '@shared/ui/status-badge';
import { useProject } from '@entities/project/hooks';
import { ProjectAnalyticsBlock } from '@widgets/project/project-analytics';
import { DailyReportsTable } from '@widgets/project/daily-reports-table';
import { ProjectBriefWidget } from '@widgets/ai-insights/project-brief';
import { CreateDailyReportButton } from '@features/create-daily-report/ui/create-daily-report-button';
import { AttendanceTable } from '@widgets/attendance/attendance-table';
import { TransactionsTable } from '@widgets/warehouse/transactions-table';
import { formatDate, formatMoney } from '@shared/lib/format';

export default function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const { data: project, isLoading } = useProject(id);

  if (isLoading || !project) return <Skeleton active />;

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={project.address ?? undefined}
        extra={
          <Space>
            <StatusBadge status={project.status as ProjectStatus} />
            <CreateDailyReportButton projectId={id} />
          </Space>
        }
      />
      <Card>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Клиент">{project.client?.name ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Старт">{formatDate(project.startDate)}</Descriptions.Item>
          <Descriptions.Item label="Дедлайн">{formatDate(project.deadline)}</Descriptions.Item>
          <Descriptions.Item label="Бюджет">{formatMoney(project.budget)}</Descriptions.Item>
          <Descriptions.Item label="План. объём">
            {project.planVolume} {project.planUnit}
          </Descriptions.Item>
          <Descriptions.Item label="Прогресс">
            {Math.round(Number(project.progress))}%
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="mt-6">
        <Tabs
          defaultActiveKey="analytics"
          items={[
            {
              key: 'analytics',
              label: 'Аналитика',
              children: <ProjectAnalyticsBlock projectId={id} />,
            },
            {
              key: 'reports',
              label: 'Отчёты прораба',
              children: <DailyReportsTable projectId={id} />,
            },
            {
              key: 'attendance',
              label: 'Посещаемость',
              children: <AttendanceTable projectId={id} />,
            },
            {
              key: 'materials',
              label: 'Материалы',
              children: <TransactionsTable projectId={id} />,
            },
            {
              key: 'ai',
              label: 'AI-бриф',
              children: <ProjectBriefWidget projectId={id} />,
            },
          ]}
        />
      </div>
    </>
  );
}
