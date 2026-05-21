'use client';

import { useState } from 'react';
import { Card, Segmented, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useExpenses } from '@entities/expense/hooks';
import type { Expense, ExpenseCategory, ExpenseScope } from '@entities/expense/types';
import { formatDate, formatMoney } from '@shared/lib/format';
import { CreateExpenseButton } from '@features/create-expense/ui/create-expense-button';
import {
  EXPENSE_CATEGORY_LABEL as CAT_LABEL,
} from '@shared/constants/expense-category';

const SCOPE_LABEL: Record<ExpenseScope, { label: string; color: string }> = {
  PROJECT: { label: 'Объект', color: 'blue' },
  COMPANY: { label: 'Компания', color: 'purple' },
  ALLOCATED: { label: 'Распределение', color: 'orange' },
};

type ScopeFilter = 'ALL' | ExpenseScope;

const SCOPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Все' },
  { value: 'PROJECT', label: 'На объектах' },
  { value: 'COMPANY', label: 'Компания' },
  { value: 'ALLOCATED', label: 'Распределяемые' },
];

const columns: ColumnsType<Expense> = [
  {
    title: 'Дата',
    dataIndex: 'date',
    key: 'date',
    width: 120,
    render: (v: string) => formatDate(v),
  },
  {
    title: 'Тип',
    dataIndex: 'scope',
    key: 'scope',
    width: 150,
    render: (s: ExpenseScope) => {
      const meta = SCOPE_LABEL[s] ?? { label: s, color: 'default' };
      return <Tag color={meta.color}>{meta.label}</Tag>;
    },
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
  // На странице объекта показываем только проектные расходы — без переключателя.
  const lockedScope: ExpenseScope | undefined = projectId ? 'PROJECT' : undefined;
  const [scope, setScope] = useState<ScopeFilter>('ALL');
  const effective = lockedScope ?? (scope === 'ALL' ? undefined : scope);
  const { data, isLoading } = useExpenses({ projectId, scope: effective, limit: 100 });

  return (
    <Card
      title="Расходы"
      extra={
        <Space>
          {!lockedScope && (
            <Segmented<ScopeFilter>
              value={scope}
              onChange={(v) => setScope(v)}
              options={SCOPE_FILTER_OPTIONS as { value: ScopeFilter; label: string }[]}
              size="small"
            />
          )}
          <CreateExpenseButton projectId={projectId} />
        </Space>
      }
    >
      <Table<Expense>
        rowKey="id"
        size="small"
        columns={lockedScope ? columns.filter((c) => c.key !== 'scope') : columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        pagination={false}
      />
    </Card>
  );
}
