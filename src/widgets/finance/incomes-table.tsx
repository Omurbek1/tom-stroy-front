'use client';

import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useIncomes } from '@entities/income/hooks';
import type { Income } from '@entities/income/types';
import { formatDate, formatMoney } from '@shared/lib/format';
import { CreateIncomeButton } from '@features/create-income/ui/create-income-button';

const columns: ColumnsType<Income> = [
  {
    title: 'Дата',
    dataIndex: 'date',
    key: 'date',
    width: 120,
    render: (v: string) => formatDate(v),
  },
  { title: 'Клиент', key: 'client', render: (_, r) => r.client?.name ?? '—' },
  { title: 'Объект', key: 'project', render: (_, r) => r.project?.name ?? '—' },
  {
    title: 'Сумма',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    width: 160,
    render: (v: number) => formatMoney(v),
  },
  { title: 'Комментарий', dataIndex: 'comment', key: 'comment' },
];

export function IncomesTable({ projectId }: { projectId?: string } = {}) {
  const { data, isLoading } = useIncomes({ projectId, limit: 100 });
  return (
    <Card title="Поступления от клиентов" extra={<CreateIncomeButton projectId={projectId} />}>
      <Table<Income>
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
