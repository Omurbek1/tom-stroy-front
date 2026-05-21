'use client';

import { use } from 'react';
import { Card, Col, Empty, Row, Tag } from 'antd';
import { CheckSquareOutlined } from '@ant-design/icons';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { useProject } from '@entities/project/hooks';

const COLUMNS = [
  { key: 'todo', title: 'Нужно сделать', tone: 'default' },
  { key: 'progress', title: 'В работе', tone: 'processing' },
  { key: 'blocked', title: 'Блокировано', tone: 'warning' },
  { key: 'done', title: 'Готово', tone: 'success' },
] as const;

export default function ObjectTasksPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);

  return (
    <>
      <PageMeta
        title="Задачи"
        subtitle="Операционный контроль работ по объекту"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Задачи' },
        ]}
      />
      <PageContainer>
        <Row gutter={[16, 16]}>
          {COLUMNS.map((col) => (
            <Col xs={24} md={12} xl={6} key={col.key}>
              <Card
                title={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {col.title}
                    <Tag color={col.tone}>0</Tag>
                  </span>
                }
              >
                <Empty
                  image={<CheckSquareOutlined style={{ fontSize: 32, color: 'var(--color-text-subtle)' }} />}
                  description="Нет задач"
                />
              </Card>
            </Col>
          ))}
        </Row>
      </PageContainer>
    </>
  );
}
