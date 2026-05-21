'use client';

import { use } from 'react';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { AttendanceTable } from '@widgets/attendance/attendance-table';
import { useProject } from '@entities/project/hooks';

export default function ObjectTeamPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Команда объекта"
        subtitle="Посещаемость и состав"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Команда' },
        ]}
      />
      <PageContainer>
        <AttendanceTable projectId={id} />
      </PageContainer>
    </>
  );
}
