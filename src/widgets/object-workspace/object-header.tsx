'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Progress, Skeleton } from 'antd';
import Link from 'next/link';
import { memo } from 'react';
import { useProject } from '@entities/project/hooks';
import { ProjectStatus, StatusBadge } from '@shared/ui/status-badge';
import { CreateDailyReportButton } from '@features/create-daily-report/ui/create-daily-report-button';
import { formatDate } from '@shared/lib/format';

interface Props {
  projectId: string;
}

/**
 * Wide header shown above ObjectTabs. Owns the object identity:
 * back-link, name, address, status, progress, deadline + primary action.
 *
 * Memoized — `projectId` is the only prop, so the header stays mounted
 * and avoids a full re-render when the user switches tabs.
 */
function ObjectHeaderImpl({ projectId }: Props) {
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading || !project) {
    return (
      <div className="object-header">
        <Skeleton active paragraph={{ rows: 1 }} title />
      </div>
    );
  }

  const progress = Math.round(Number(project.progress));
  const deadline = project.deadline ? formatDate(project.deadline) : null;

  return (
    <div className="object-header">
      <div className="object-header__top">
        <Link href="/objects" className="object-header__back" prefetch>
          <ArrowLeftOutlined />
          <span>Все объекты</span>
        </Link>
      </div>
      <div className="object-header__row">
        <div className="object-header__identity">
          <div className="object-header__name-row">
            <h1 className="object-header__name" title={project.name}>
              {project.name}
            </h1>
            <StatusBadge status={project.status as ProjectStatus} />
          </div>
          <div className="object-header__sub">
            {project.address && <span>{project.address}</span>}
            {project.client?.name && <span>• {project.client.name}</span>}
            {deadline && <span>• Дедлайн {deadline}</span>}
          </div>
        </div>
        <div className="object-header__actions">
          <div className="object-header__progress">
            <div className="object-header__progress-label">
              <span>Прогресс</span>
              <strong>{progress}%</strong>
            </div>
            <Progress
              percent={progress}
              size="small"
              showInfo={false}
              strokeColor="var(--ant-color-primary, #1677ff)"
            />
          </div>
          <CreateDailyReportButton projectId={projectId} />
        </div>
      </div>
    </div>
  );
}

export const ObjectHeader = memo(ObjectHeaderImpl);
