'use client';

import { use } from 'react';
import { Card, Empty } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { useProject } from '@entities/project/hooks';

export default function ObjectDocumentsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  return (
    <>
      <PageMeta
        title="Документы объекта"
        subtitle="Контракты, акты, чертежи"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Документы' },
        ]}
      />
      <PageContainer>
        <Card>
          <Empty
            image={<FolderOpenOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
            description="UI документов появится после согласования формата хранения файлов."
          />
        </Card>
      </PageContainer>
    </>
  );
}
