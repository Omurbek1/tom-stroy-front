'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Input,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { message } from '@shared/lib/antd-static';
import { useDeleteExpense, useExpenses } from '@entities/expense/hooks';
import type { Expense, ExpenseCategory, ExpenseScope } from '@entities/expense/types';
import { CreateExpenseButton } from '@features/create-expense/ui/create-expense-button';
import { formatDate, formatMoney } from '@shared/lib/format';
import './object-finance/object-finance.css';

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

const SCOPE_LABEL: Record<ExpenseScope, { label: string; color: string }> = {
  PROJECT: { label: 'Объект', color: 'blue' },
  COMPANY: { label: 'Компания', color: 'purple' },
  ALLOCATED: { label: 'Распределение', color: 'orange' },
};

type ScopeFilter = 'ALL' | ExpenseScope;

const SCOPE_FILTER_OPTIONS: { value: ScopeFilter; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'PROJECT', label: 'На объектах' },
  { value: 'COMPANY', label: 'Компания' },
  { value: 'ALLOCATED', label: 'Распределяемые' },
];

const CAT_OPTIONS = (Object.keys(CAT_LABEL) as ExpenseCategory[]).map((v) => ({
  value: v,
  label: CAT_LABEL[v],
}));

export function ExpensesTable({ projectId }: { projectId?: string } = {}) {
  const lockedScope: ExpenseScope | undefined = projectId ? 'PROJECT' : undefined;
  const [scope, setScope] = useState<ScopeFilter>('ALL');
  const [category, setCategory] = useState<ExpenseCategory | undefined>();
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<Expense | null>(null);

  const deleteMutation = useDeleteExpense();

  const effective = lockedScope ?? (scope === 'ALL' ? undefined : scope);
  const { data, isLoading } = useExpenses({
    projectId,
    scope: effective,
    category,
    from: range?.[0]?.startOf('day').toISOString(),
    to: range?.[1]?.endOf('day').toISOString(),
    limit: 200,
  });

  const all = data?.data ?? [];
  const filtered = useMemo(
    () =>
      search
        ? all.filter(
            (r) =>
              r.comment?.toLowerCase().includes(search.toLowerCase()) ||
              CAT_LABEL[r.category]?.toLowerCase().includes(search.toLowerCase()) ||
              r.project?.name?.toLowerCase().includes(search.toLowerCase()),
          )
        : all,
    [all, search],
  );

  const total = useMemo(
    () => filtered.reduce((s, r) => s + Number(r.amount), 0),
    [filtered],
  );

  const byCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const r of filtered) {
      map.set(r.category, (map.get(r.category) ?? 0) + Number(r.amount));
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Расход удалён');
    } catch {
      message.error('Не удалось удалить');
    }
  };

  const columns: ColumnsType<Expense> = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      sorter: (a, b) => +new Date(a.date) - +new Date(b.date),
      defaultSortOrder: 'descend',
      render: (v: string) => formatDate(v),
    },
    ...(lockedScope
      ? []
      : [
          {
            title: 'Тип',
            dataIndex: 'scope',
            key: 'scope',
            width: 130,
            render: (s: ExpenseScope) => {
              const meta = SCOPE_LABEL[s] ?? { label: s, color: 'default' };
              return <Tag color={meta.color}>{meta.label}</Tag>;
            },
          } as const,
        ]),
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      filters: CAT_OPTIONS.map((c) => ({ text: c.label, value: c.value })),
      onFilter: (value, r) => r.category === value,
      render: (c: ExpenseCategory) => <Tag>{CAT_LABEL[c] ?? c}</Tag>,
    },
    {
      title: 'Объект',
      key: 'project',
      ellipsis: true,
      render: (_, r) => r.project?.name ?? '—',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (v: string | null | undefined) => v || '—',
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      align: 'right',
      render: (_, r) => (
        <Space size={0}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setEditTarget(r);
            }}
          />
          <Popconfirm
            title="Удалить расход?"
            description="Это снимет его из P&L и отчётов"
            onConfirm={() => handleDelete(r.id)}
            okButtonProps={{ danger: true }}
            okText="Удалить"
            cancelText="Отмена"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <Space size={12}>
            <span>Расходы</span>
            <Tag color="orange">{filtered.length} строк</Tag>
            <span style={{ color: 'var(--ant-color-text-tertiary, #8c8c8c)', fontSize: 13 }}>
              Итого: <strong style={{ color: 'var(--finance-expense, #cf1322)' }}>{formatMoney(total)}</strong>
            </span>
          </Space>
        }
        extra={<CreateExpenseButton projectId={projectId} />}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Filter bar */}
          <Space wrap size="small" style={{ width: '100%' }}>
            {!lockedScope && (
              <Segmented<ScopeFilter>
                value={scope}
                onChange={(v) => setScope(v)}
                options={SCOPE_FILTER_OPTIONS}
                size="small"
              />
            )}
            <Select
              allowClear
              placeholder="Категория"
              size="small"
              style={{ width: 180 }}
              value={category}
              onChange={setCategory}
              options={CAT_OPTIONS}
              showSearch
              optionFilterProp="label"
            />
            <DatePicker.RangePicker
              size="small"
              value={range ?? undefined}
              onChange={(r) => setRange(r ? [r[0]!, r[1]!] : null)}
              format="DD.MM.YYYY"
              allowClear
            />
            <Input
              size="small"
              prefix={<FilterOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Поиск в комментариях"
              style={{ width: 220 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Space>

          {/* Category mini-totals */}
          {byCategory.length > 0 && (
            <div className="exp-cat-chips">
              {byCategory.map(([cat, sum]) => (
                <span key={cat} className="exp-cat-chip">
                  <span className="exp-cat-chip__label">{CAT_LABEL[cat]}</span>
                  <span className="exp-cat-chip__value">{formatMoney(sum)}</span>
                </span>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <Empty description="Расходов за выбранный период нет" />
          ) : (
            <Table<Expense>
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={filtered}
              loading={isLoading}
              pagination={{ pageSize: 20, showSizeChanger: false }}
              scroll={{ x: 980 }}
              onRow={(record) => ({
                onClick: () => setEditTarget(record),
                style: { cursor: 'pointer' },
              })}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={lockedScope ? 3 : 4}>
                      <strong>Итого за период</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong style={{ color: 'var(--finance-expense, #cf1322)' }}>
                        {formatMoney(total)}
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={2}> </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          )}
        </Space>
      </Card>

      <CreateExpenseButton
        projectId={projectId}
        expense={editTarget}
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        hideTrigger
      />
    </>
  );
}
