'use client';

import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useBrigades } from '@entities/brigade/hooks';
import type { Brigade } from '@entities/brigade/types';
import { BrigadeDetailDrawer } from './brigade-detail-drawer';

const columns: ColumnsType<Brigade> = [
  { title: 'Название', dataIndex: 'name', key: 'name' },
  {
    title: 'Специализация',
    dataIndex: 'specialization',
    key: 'specialization',
    render: (v) => (v ? <Tag>{v}</Tag> : '—'),
  },
  {
    title: 'Прораб',
    key: 'foreman',
    render: (_, r) => r.foreman?.fullName ?? '—',
  },
  {
    title: 'Сотрудников',
    key: 'members',
    align: 'right',
    width: 130,
    render: (_, r) => r._count?.members ?? 0,
  },
  {
    title: 'Работ',
    key: 'works',
    align: 'right',
    width: 100,
    render: (_, r) => r._count?.works ?? 0,
  },
];

export function BrigadesTable() {
  const { data, isLoading } = useBrigades();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Card title="Бригады">
      <Table<Brigade>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        pagination={false}
        onRow={(record) => ({
          onClick: () => setOpenId(record.id),
          style: { cursor: 'pointer' },
        })}
      />
      <BrigadeDetailDrawer
        brigadeId={openId}
        open={openId !== null}
        onClose={() => setOpenId(null)}
      />
    </Card>
  );
}
