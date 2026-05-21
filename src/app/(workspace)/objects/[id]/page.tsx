'use client';

import { use, useEffect } from 'react';
import { Card, Descriptions, Skeleton, Space } from 'antd';
import { useProject } from '@entities/project/hooks';
import { useRecentsStore } from '@app-init/store/recents-store';
import { usePinnedObjects } from '@shared/lib/pinned-objects';
import { ProjectAnalyticsBlock } from '@widgets/project/project-analytics';
import { ProjectBriefWidget } from '@widgets/ai-insights/project-brief';
import { InsightsList } from '@widgets/ai-insights/insights-list';
import { formatDate, formatMoney } from '@shared/lib/format';
import { useProjectRealtime } from '@shared/hooks/use-project-realtime';
import { PageContainer } from '@shared/ui/page-container';

/**
 * Object dashboard — landing inside the object workspace. The wrapping
 * layout already renders ObjectHeader + ObjectTabs, so this page just
 * shows the body content.
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
  );
}
