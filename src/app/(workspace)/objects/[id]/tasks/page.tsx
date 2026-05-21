'use client';

import { use } from 'react';
import { Card, Empty } from 'antd';
import { CheckSquareOutlined } from '@ant-design/icons';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { useProject } from '@entities/project/hooks';

/**
 * Tasks placeholder. The `Task` model has not been added yet — once it
 * lands (см. план Sprint T1), эта страница превращается в полноценный
 * kanban-board: OPEN / IN_PROGRESS / BLOCKED / DONE.
 */
export default function ObjectTasksPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Задачи"
        subtitle="Канбан задач по объекту"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Задачи' },
        ]}
      />
      <PageContainer>
        <Card>
          <Empty
            image={<CheckSquareOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
            description={
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>Задачи — следующий спринт</div>
                <div style={{ color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
                  Здесь будет канбан с задачами по объекту: открыто / в работе / заблокировано / готово.
                </div>
              </div>
            }
          />
        </Card>
      </PageContainer>
    </>
  );
}
