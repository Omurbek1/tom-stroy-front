'use client';

import { use } from 'react';
import { Space } from 'antd';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { AttendanceTable } from '@widgets/attendance/attendance-table';
import { ProjectTeamPanel } from '@widgets/project-team/project-team-panel';
import { useProject } from '@entities/project/hooks';

export default function ObjectTeamPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Команда объекта"
        subtitle="Состав и посещаемость"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Команда' },
        ]}
      />
      <PageContainer>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <ProjectTeamPanel projectId={id} />
          <AttendanceTable projectId={id} />
        </Space>
      </PageContainer>
    </>
  );
}
