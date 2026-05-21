'use client';

import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useVehicles } from '@entities/vehicle/hooks';
import type { Vehicle } from '@entities/vehicle/types';
import { formatNumber } from '@shared/lib/format';
import { VEHICLE_STATUS_META } from '@shared/constants/vehicle-status';

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
    render: (s: string) => {
      const meta = VEHICLE_STATUS_META[s as keyof typeof VEHICLE_STATUS_META];
      return <Tag color={meta?.color ?? 'default'}>{meta?.label ?? s}</Tag>;
    },
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
