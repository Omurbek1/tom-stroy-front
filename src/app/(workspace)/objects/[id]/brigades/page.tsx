'use client';

import { use } from 'react';
import { Alert, Card, Empty } from 'antd';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { useProject } from '@entities/project/hooks';

/**
 * Brigades on this object. Без явной модели «бригада на объекте»
 * сейчас бригады «появляются» через DailyReport.brigadeId. UI здесь
 * заглушка до тех пор, пока не добавим ProjectBrigade many-to-many.
 */
export default function ObjectBrigadesPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Бригады на объекте"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Бригады' },
        ]}
      />
      <PageContainer>
        <Alert
          showIcon
          type="info"
          message="Membership-связь в разработке"
          description="Сейчас бригаду к объекту привязывает только история отчётов прораба. Скоро добавим явное прикрепление."
          style={{ marginBottom: 16 }}
        />
        <Card>
          <Empty description="Список бригад на объекте появится в следующем спринте." />
        </Card>
      </PageContainer>
    </>
  );
}
