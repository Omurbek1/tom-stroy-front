'use client';

import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useUsages } from '@entities/vehicle/hooks';
import type { VehicleUsage } from '@entities/vehicle/types';
import { formatDate, formatMoney, formatNumber } from '@shared/lib/format';

const columns: ColumnsType<VehicleUsage> = [
  {
    title: 'Дата',
    dataIndex: 'date',
    key: 'date',
    width: 110,
    render: (v: string) => formatDate(v),
  },
  {
    title: 'Техника',
    key: 'vehicle',
    render: (_, r) =>
      r.vehicle ? `${r.vehicle.type}${r.vehicle.plate ? ` · ${r.vehicle.plate}` : ''}` : '—',
  },
  { title: 'Объект', key: 'project', render: (_, r) => r.project?.name ?? '—' },
  {
    title: 'Часы',
    dataIndex: 'hoursUsed',
    key: 'hoursUsed',
    align: 'right',
    width: 90,
    render: (v: number) => formatNumber(v),
  },
  {
    title: 'Топливо, л',
    dataIndex: 'fuelUsed',
    key: 'fuelUsed',
    align: 'right',
    width: 110,
    render: (v: number) => formatNumber(v),
  },
  {
    title: 'Стоимость',
    dataIndex: 'cost',
    key: 'cost',
    align: 'right',
    width: 140,
    render: (v: number) => formatMoney(v),
  },
];

export function UsagesTable({ projectId }: { projectId?: string } = {}) {
  const { data, isLoading } = useUsages({ projectId, limit: 100 });
  return (
    <Card title="Использование техники">
      <Table<VehicleUsage>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        pagination={false}
      />
    </Card>
  );
}
