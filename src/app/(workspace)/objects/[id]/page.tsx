'use client';

import { use, useEffect } from 'react';
import { Card, Descriptions, Skeleton, Space } from 'antd';
import { PageMeta } from '@shared/ui/page-meta';
import { StatusBadge, ProjectStatus } from '@shared/ui/status-badge';
import { useProject } from '@entities/project/hooks';
import { useRecentsStore } from '@app-init/store/recents-store';
import { usePinnedObjects } from '@shared/lib/pinned-objects';
import { ProjectAnalyticsBlock } from '@widgets/project/project-analytics';
import { ProjectBriefWidget } from '@widgets/ai-insights/project-brief';
import { CreateDailyReportButton } from '@features/create-daily-report/ui/create-daily-report-button';
import { InsightsList } from '@widgets/ai-insights/insights-list';
import { formatDate, formatMoney } from '@shared/lib/format';
import { useProjectRealtime } from '@shared/hooks/use-project-realtime';
import { PageContainer } from '@shared/ui/page-container';

/**
 * Object dashboard — overview of the object workspace. Other sections
 * (reports / finance / warehouse / team / …) live in sibling routes
 * `/objects/[id]/<segment>`. This page is the landing inside the
 * workspace.
 */
export default function ObjectDashboardPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  useProjectRealtime(id);
  const { data: project, isLoading } = useProject(id);
  const pushRecent = useRecentsStore((s) => s.push);
  const trackObject = usePinnedObjects().track;

  useEffect(() => {
    if (!project) return;
    pushRecent({
      id: `project-${project.id}`,
      href: `/objects/${project.id}`,
      title: project.name,
      subtitle: project.address ?? project.client?.name ?? undefined,
      group: 'Объекты',
    });
    trackObject(project.id);
  }, [project, pushRecent, trackObject]);

  if (isLoading || !project) return <Skeleton active />;

  return (
    <>
      <PageMeta
        title={project.name}
        subtitle={project.address ?? undefined}
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { label: project.name },
        ]}
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

        <ProjectAnalyticsBlock projectId={id} />

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <InsightsList projectId={id} title="Риски и подсказки AI" />
          <ProjectBriefWidget projectId={id} />
        </Space>
      </PageContainer>
    </>
  );
}
