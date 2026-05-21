'use client';

import { Card, Space, Table, Tag, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useAttendance } from '@entities/attendance/hooks';
import type { Attendance, AttendanceStatus } from '@entities/attendance/types';
import { formatDate, formatNumber } from '@shared/lib/format';

const STATUS_META: Record<AttendanceStatus, { label: string; color: string }> = {
  PRESENT: { label: 'Вышел', color: 'green' },
  LATE: { label: 'Опоздал', color: 'orange' },
  ABSENT: { label: 'Отсутствует', color: 'red' },
  SICK_LEAVE: { label: 'Больничный', color: 'blue' },
  DAY_OFF: { label: 'Выходной', color: 'default' },
};

const columns: ColumnsType<Attendance> = [
  {
    title: 'Дата',
    dataIndex: 'date',
    key: 'date',
    width: 120,
    render: (v: string) => formatDate(v),
  },
  { title: 'Сотрудник', key: 'employee', render: (_, r) => r.employee?.fullName ?? '—' },
  { title: 'Объект', key: 'project', render: (_, r) => r.project?.name ?? '—' },
  {
    title: 'Часы',
    dataIndex: 'hours',
    key: 'hours',
    align: 'right',
    width: 100,
    render: (v: number) => formatNumber(v),
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    width: 140,
    render: (s: AttendanceStatus) => (
      <Tag color={STATUS_META[s]?.color}>{STATUS_META[s]?.label ?? s}</Tag>
    ),
  },
];

export function AttendanceTable({ projectId }: { projectId?: string } = {}) {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);
  const { data, isLoading } = useAttendance({
    projectId,
    from: range?.[0].startOf('day').toISOString(),
    to: range?.[1].endOf('day').toISOString(),
    limit: 200,
  });

  return (
    <Card title="Посещаемость">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <DatePicker.RangePicker
          value={range ?? undefined}
          onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
          format="DD.MM.YYYY"
        />
        <Table<Attendance>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={data?.data ?? []}
          loading={isLoading}
          pagination={false}
        />
      </Space>
    </Card>
  );
}
