'use client';

import { use, useEffect } from 'react';
import { Card, Descriptions, Skeleton, Space, Tabs } from 'antd';
import dayjs from 'dayjs';
import { PageMeta } from '@shared/ui/page-meta';
import { StatusBadge, ProjectStatus } from '@shared/ui/status-badge';
import { useProject } from '@entities/project/hooks';
import { useRecentsStore } from '@app-init/store/recents-store';
import { ProjectAnalyticsBlock } from '@widgets/project/project-analytics';
import { DailyReportsTable } from '@widgets/project/daily-reports-table';
import { ProjectBriefWidget } from '@widgets/ai-insights/project-brief';
import { CreateDailyReportButton } from '@features/create-daily-report/ui/create-daily-report-button';
import { AttendanceTable } from '@widgets/attendance/attendance-table';
import { TransactionsTable } from '@widgets/warehouse/transactions-table';
import { PnlCard } from '@widgets/finance/pnl-card';
import { FinanceTimeseriesChart } from '@widgets/finance/timeseries-chart';
import { ExpensesTable } from '@widgets/finance/expenses-table';
import { IncomesTable } from '@widgets/finance/incomes-table';
import { ExportPnlButton } from '@features/export-pnl/ui/export-pnl-button';
import { InsightsList } from '@widgets/ai-insights/insights-list';
import { UsagesTable } from '@widgets/vehicles/usages-table';
import { formatDate, formatMoney } from '@shared/lib/format';
import { useProjectRealtime } from '@shared/hooks/use-project-realtime';
import { PageContainer } from '@shared/ui/page-container';

export default function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  useProjectRealtime(id);
  const { data: project, isLoading } = useProject(id);
  const pushRecent = useRecentsStore((s) => s.push);

  useEffect(() => {
    if (!project) return;
    pushRecent({
      id: `project-${project.id}`,
      href: `/projects/${project.id}`,
      title: project.name,
      subtitle: project.address ?? project.client?.name ?? undefined,
      group: 'Объекты',
    });
  }, [project, pushRecent]);

  if (isLoading || !project) return <Skeleton active />;

  // P&L window: project lifetime if dates set, otherwise last 90 days
  const from = (project.startDate
    ? dayjs(project.startDate)
    : dayjs().subtract(90, 'day')
  )
    .startOf('day')
    .toISOString();
  const to = (project.deadline ? dayjs(project.deadline) : dayjs()).endOf('day').toISOString();

  return (
    <>
      <PageMeta
        title={project.name}
        subtitle={project.address ?? undefined}
        breadcrumbs={[{ href: '/projects', label: 'Объекты' }, { label: project.name }]}
        actions={
          <Space>
            <StatusBadge status={project.status as ProjectStatus} />
            <CreateDailyReportButton projectId={id} />
          </Space>
        }
      />
      <PageContainer>
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
              key: 'vehicles',
              label: 'Техника',
              children: <UsagesTable projectId={id} />,
            },
            {
              key: 'finance',
              label: 'Финансы',
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'right' }}>
                    <ExportPnlButton from={from} to={to} projectId={id} />
                  </div>
                  <PnlCard from={from} to={to} projectId={id} />
                  <FinanceTimeseriesChart from={from} to={to} projectId={id} title="Доходы и расходы объекта" />
                  <IncomesTable projectId={id} />
                  <ExpensesTable projectId={id} />
                </Space>
              ),
            },
            {
              key: 'ai',
              label: 'AI',
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <InsightsList projectId={id} title="Риски" />
                  <ProjectBriefWidget projectId={id} />
                </Space>
              ),
            },
          ]}
        />
      </PageContainer>
    </>
  );
}
