'use client';

import { Card, Input, Rate, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useSuppliers } from '@entities/supplier/hooks';
import type { Supplier } from '@entities/supplier/types';
import { CreateSupplierModal } from '@features/create-supplier/ui/create-supplier-modal';

export function SuppliersTable() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useSuppliers({ search: search || undefined, limit: 200 });

  const columns: ColumnsType<Supplier> = [
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
      title: 'ИНН',
      dataIndex: 'inn',
      key: 'inn',
      width: 160,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: 'Рейтинг',
      dataIndex: 'rating',
      key: 'rating',
      width: 140,
      render: (v: number) =>
        v > 0 ? <Rate disabled allowHalf value={v} style={{ fontSize: 14 }} /> : '—',
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (v: boolean) =>
        v ? <Tag color="green">Активен</Tag> : <Tag color="default">Скрыт</Tag>,
    },
  ];

  return (
    <Card title="Поставщики" extra={<CreateSupplierModal />}>
      <Space style={{ marginBottom: 12 }}>
        <Input.Search
          placeholder="Поиск по названию или ИНН"
          allowClear
          onSearch={setSearch}
          onChange={(e) => !e.target.value && setSearch('')}
          style={{ width: 320 }}
        />
      </Space>
      <Table<Supplier>
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
