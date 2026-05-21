'use client';

import { Button, Card, Popconfirm, Table, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useDeleteWarehouse,
  useWarehouses,
  type Warehouse,
  type WarehouseKind,
} from '@entities/warehouse/hooks';
import { message } from '@shared/lib/antd-static';
import { CreateWarehouseButton } from '@features/create-warehouse/ui/create-warehouse-button';

const KIND_META: Record<WarehouseKind, { label: string; color: string }> = {
  MAIN: { label: 'Главный', color: 'blue' },
  PROJECT: { label: 'Объект', color: 'green' },
  BRIGADE: { label: 'Бригада', color: 'purple' },
  TEMP: { label: 'Транзит', color: 'default' },
};

export function WarehousesTable() {
  const { data, isLoading } = useWarehouses();
  const remove = useDeleteWarehouse();

  const onDelete = (id: string) =>
    remove.mutate(id, {
      onSuccess: () => message.success('Склад удалён'),
      onError: (err: unknown) => {
        const detail =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        message.error(typeof detail === 'string' ? detail : 'Не удалось удалить склад');
      },
    });

  const columns: ColumnsType<Warehouse> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          {r.address && (
            <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
              {r.address}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'kind',
      key: 'kind',
      width: 140,
      render: (v: WarehouseKind | undefined) => {
        const meta = KIND_META[(v ?? 'MAIN') as WarehouseKind];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Товаров',
      key: 'items',
      align: 'right',
      width: 110,
      render: (_, r) => r._count?.items ?? 0,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, r) => {
        if (r.brigadeId) return null;
        return (
          <Popconfirm
            title="Удалить склад?"
            description="Склад будет помечен как удалённый. Движения сохранятся в истории."
            okText="Удалить"
            okButtonProps={{ danger: true }}
            cancelText="Нет"
            onConfirm={() => onDelete(r.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} loading={remove.isPending} />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card title="Склады" extra={<CreateWarehouseButton />}>
      <Table<Warehouse>
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
