'use client';

import { use } from 'react';
import { Space } from 'antd';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { DailyReportsTable } from '@widgets/project/daily-reports-table';
import { CreateDailyReportButton } from '@features/create-daily-report/ui/create-daily-report-button';
import { useProject } from '@entities/project/hooks';

export default function ObjectReportsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Отчёты прораба"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Отчёты' },
        ]}
        actions={
          <Space>
            <CreateDailyReportButton projectId={id} />
          </Space>
        }
      />
      <PageContainer>
        <DailyReportsTable projectId={id} />
      </PageContainer>
    </>
  );
}
