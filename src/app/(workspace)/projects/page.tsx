'use client';

import { Card, Input, Progress, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useState } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { StatusBadge, ProjectStatus } from '@shared/ui/status-badge';
import { useProjectsList } from '@entities/project/hooks';
import type { Project } from '@entities/project/types';
import { formatMoney, formatDate } from '@shared/lib/format';
import { CreateProjectButton } from '@features/create-project/ui/create-project-button';

const columns: ColumnsType<Project> = [
  {
    title: 'Объект',
    dataIndex: 'name',
    key: 'name',
    render: (_, p) => <Link href={`/projects/${p.id}`}>{p.name}</Link>,
  },
  {
    title: 'Клиент',
    key: 'client',
    render: (_, p) => p.client?.name ?? '—',
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (s: ProjectStatus) => <StatusBadge status={s} />,
  },
  {
    title: 'Прогресс',
    dataIndex: 'progress',
    key: 'progress',
    width: 200,
    render: (v: number) => <Progress percent={Math.round(Number(v))} size="small" />,
  },
  {
    title: 'Дедлайн',
    dataIndex: 'deadline',
    key: 'deadline',
    width: 130,
    render: (d: string | null) => formatDate(d),
  },
  {
    title: 'Бюджет',
    dataIndex: 'budget',
    key: 'budget',
    align: 'right',
    width: 160,
    render: (v: number) => formatMoney(v),
  },
];

export default function ProjectsListPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProjectsList({ search, limit: 50 });

  return (
    <>
      <PageHeader
        title="Объекты"
        subtitle="Все стройки компании"
        extra={<CreateProjectButton />}
      />
      <PageContainer>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input.Search
              placeholder="Поиск по названию"
              allowClear
              onSearch={setSearch}
              style={{ maxWidth: 360 }}
            />
            <div className="table-shell">
              <Table<Project>
                rowKey="id"
                columns={columns}
                dataSource={data?.data ?? []}
                loading={isLoading}
                pagination={false}
                sticky
                scroll={{ x: 1000 }}
              />
            </div>
          </Space>
        </Card>
      </PageContainer>
    </>
  );
}
