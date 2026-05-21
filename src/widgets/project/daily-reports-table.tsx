'use client';

import { Card, Table, Tag } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useDailyReports } from '@entities/daily-report/hooks';
import type { DailyReport } from '@entities/daily-report/types';
import { formatDate } from '@shared/lib/format';
import { DailyReportDetailDrawer } from './daily-report-detail-drawer';

const columns: ColumnsType<DailyReport> = [
  {
    title: 'Дата',
    dataIndex: 'date',
    key: 'date',
    render: (v: string) => formatDate(v),
  },
  {
    title: 'Прораб',
    key: 'foreman',
    render: (_, r) => r.foreman?.fullName ?? '—',
  },
  {
    title: 'Бригада',
    key: 'brigade',
    render: (_, r) => r.brigade?.name ?? '—',
  },
  {
    title: 'Работ',
    key: 'works',
    align: 'right',
    render: (_, r) => r._count?.works ?? 0,
  },
  {
    title: 'Посещаемость',
    key: 'attendance',
    align: 'right',
    render: (_, r) => r._count?.attendance ?? 0,
  },
  {
    title: 'Фото',
    key: 'photos',
    align: 'right',
    width: 80,
    render: (_, r) => {
      const n = r._count?.photos ?? 0;
      return n > 0 ? (
        <span>
          <PictureOutlined /> {n}
        </span>
      ) : (
        '—'
      );
    },
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (s: string) => <Tag>{s}</Tag>,
  },
];

export function DailyReportsTable({ projectId }: { projectId: string }) {
  const { data, isLoading } = useDailyReports({ projectId, limit: 50 });
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <Card title="История отчётов">
        <Table<DailyReport>
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
      </Card>
      <DailyReportDetailDrawer
        reportId={openId ?? undefined}
        open={openId !== null}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}
