'use client';

import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useVehicles } from '@entities/vehicle/hooks';
import type { Vehicle } from '@entities/vehicle/types';
import { formatNumber } from '@shared/lib/format';

const STATUS_COLOR: Record<string, string> = {
  idle: 'default',
  'on-project': 'green',
  maintenance: 'orange',
  broken: 'red',
};

const columns: ColumnsType<Vehicle> = [
  { title: 'Тип', dataIndex: 'type', key: 'type' },
  { title: 'Гос. номер', dataIndex: 'plate', key: 'plate', render: (v) => v ?? '—' },
  {
    title: 'Водитель',
    key: 'driver',
    render: (_, r) => r.driver?.fullName ?? '—',
  },
  {
    title: 'Топливо, л',
    dataIndex: 'fuelLitres',
    key: 'fuelLitres',
    align: 'right',
    width: 130,
    render: (v: number) => formatNumber(v),
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    width: 140,
    render: (s: string) => <Tag color={STATUS_COLOR[s] ?? 'default'}>{s}</Tag>,
  },
];

export function VehiclesTable() {
  const { data, isLoading } = useVehicles();
  return (
    <Card title="Парк техники">
      <Table<Vehicle>
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
