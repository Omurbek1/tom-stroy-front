'use client';

import { use } from 'react';
import { Skeleton, Space } from 'antd';
import dynamic from 'next/dynamic';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { useProject } from '@entities/project/hooks';

// Both panels are ~450/80 LOC of tables + modals. Lazy-splitting drops
// the team route's First Load JS — main content is hidden behind the
// tab anyway, skeleton fallback prints instantly.
const ProjectTeamPanel = dynamic(
  () =>
    import('@widgets/project-team/project-team-panel').then((m) => ({
      default: m.ProjectTeamPanel,
    })),
  {
    ssr: false,
    loading: () => <Skeleton active paragraph={{ rows: 6 }} />,
  },
);
const AttendanceTable = dynamic(
  () =>
    import('@widgets/attendance/attendance-table').then((m) => ({
      default: m.AttendanceTable,
    })),
  {
    ssr: false,
    loading: () => <Skeleton active paragraph={{ rows: 4 }} />,
  },
);

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
