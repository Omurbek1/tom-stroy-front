'use client';

import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useExpenses } from '@entities/expense/hooks';
import type { Expense, ExpenseCategory } from '@entities/expense/types';
import { formatDate, formatMoney } from '@shared/lib/format';
import { CreateExpenseButton } from '@features/create-expense/ui/create-expense-button';

const CAT_LABEL: Record<ExpenseCategory, string> = {
  MATERIALS: 'Материалы',
  SALARY: 'Зарплаты',
  EQUIPMENT: 'Техника',
  FUEL: 'Топливо',
  RENT: 'Аренда',
  TOOLS: 'Инструменты',
  TRANSPORT: 'Транспорт',
  TAXES: 'Налоги',
  OTHER: 'Прочее',
};

const columns: ColumnsType<Expense> = [
  {
    title: 'Дата',
    dataIndex: 'date',
    key: 'date',
    width: 120,
    render: (v: string) => formatDate(v),
  },
  {
    title: 'Категория',
    dataIndex: 'category',
    key: 'category',
    width: 160,
    render: (c: ExpenseCategory) => <Tag>{CAT_LABEL[c] ?? c}</Tag>,
  },
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

export function ExpensesTable({ projectId }: { projectId?: string } = {}) {
  const { data, isLoading } = useExpenses({ projectId, limit: 100 });
  return (
    <Card title="Расходы" extra={<CreateExpenseButton projectId={projectId} />}>
      <Table<Expense>
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
