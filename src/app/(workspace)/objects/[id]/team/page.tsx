'use client';

import { use } from 'react';
import { Alert } from 'antd';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { AttendanceTable } from '@widgets/attendance/attendance-table';
import { useProject } from '@entities/project/hooks';

/**
 * Team of the object — until ProjectMember model is added (см. план
 * Sprint M1), показываем посещаемость как сурогат "кто на объекте".
 */
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
        <Alert
          showIcon
          type="info"
          message="Membership-модель в разработке"
          description="Пока показываем тех, кто был отмечен в посещаемости. Скоро появится явный список «постоянных» сотрудников объекта."
          style={{ marginBottom: 16 }}
        />
        <AttendanceTable projectId={id} />
      </PageContainer>
    </>
  );
}
