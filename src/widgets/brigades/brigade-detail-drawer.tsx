'use client';

import { Descriptions, Drawer, Empty, Skeleton, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useBrigade } from '@entities/brigade/hooks';
import type { BrigadeMember } from '@entities/brigade/types';
import { formatDate } from '@shared/lib/format';

const memberColumns: ColumnsType<BrigadeMember> = [
  { title: 'Сотрудник', key: 'name', render: (_, r) => r.employee.fullName },
  {
    title: 'Должность',
    key: 'role',
    width: 160,
    render: (_, r) => <Tag>{r.employee.role}</Tag>,
  },
  {
    title: 'В бригаде с',
    dataIndex: 'joinedAt',
    key: 'joinedAt',
    width: 130,
    render: (v: string) => formatDate(v),
  },
];

interface Props {
  brigadeId: string | null;
  open: boolean;
  onClose: () => void;
}

export function BrigadeDetailDrawer({ brigadeId, open, onClose }: Props) {
  const { data, isLoading } = useBrigade(open ? brigadeId ?? undefined : undefined);

  return (
    <Drawer
      title={data ? data.name : 'Бригада'}
      width={620}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      {isLoading || !data ? (
        <Skeleton active />
      ) : (
        <>
          <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Специализация">
              {data.specialization ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Прораб">{data.foreman?.fullName ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Работ выполнено">{data._count?.works ?? 0}</Descriptions.Item>
          </Descriptions>
          {data.members.length === 0 ? (
            <Empty description="Нет сотрудников в бригаде" />
          ) : (
            <Table<BrigadeMember>
              rowKey="id"
              size="small"
              columns={memberColumns}
              dataSource={data.members}
              pagination={false}
            />
          )}
        </>
      )}
    </Drawer>
  );
}
