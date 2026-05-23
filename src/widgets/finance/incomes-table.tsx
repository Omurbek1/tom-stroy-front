'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { message } from '@shared/lib/antd-static';
import { useDeleteIncome, useIncomes } from '@entities/income/hooks';
import type { Income } from '@entities/income/types';
import { CreateIncomeButton } from '@features/create-income/ui/create-income-button';
import { formatDate, formatMoney } from '@shared/lib/format';

export function IncomesTable({ projectId }: { projectId?: string } = {}) {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<Income | null>(null);

  const deleteMutation = useDeleteIncome();
  const { data, isLoading } = useIncomes({
    projectId,
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
              r.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
              r.project?.name?.toLowerCase().includes(search.toLowerCase()),
          )
        : all,
    [all, search],
  );

  const total = useMemo(
    () => filtered.reduce((s, r) => s + Number(r.amount), 0),
    [filtered],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        message.success('Поступление удалено');
      } catch {
        message.error('Не удалось удалить');
      }
    },
    [deleteMutation],
  );

  const onEdit = useCallback(
    (e: React.MouseEvent, r: Income) => {
      e.stopPropagation();
      setEditTarget(r);
    },
    [],
  );
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  // Memoize columns — without this AntD Table re-keys every cell whenever
  // filters / search / edit state changes in the parent.
  const columns: ColumnsType<Income> = useMemo(
    () => [
      {
        title: 'Дата',
        dataIndex: 'date',
        key: 'date',
        width: 110,
        sorter: (a, b) => +new Date(a.date) - +new Date(b.date),
        defaultSortOrder: 'descend',
        render: (v: string) => formatDate(v),
      },
      {
        title: 'Клиент',
        key: 'client',
        ellipsis: true,
        render: (_, r) => r.client?.name ?? '—',
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
        width: 160,
        align: 'right',
        sorter: (a, b) => Number(a.amount) - Number(b.amount),
        render: (v: number) => (
          <strong style={{ color: 'var(--finance-income, #389e0d)' }}>
            +{formatMoney(v)}
          </strong>
        ),
      },
      {
        title: 'Назначение',
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
              onClick={(e) => onEdit(e, r)}
            />
            <Popconfirm
              title="Удалить поступление?"
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
                onClick={stopProp}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [onEdit, stopProp, handleDelete],
  );

  return (
    <>
      <Card
        title={
          <Space size={12}>
            <span>Поступления от клиентов</span>
            <Tag color="green">{filtered.length} строк</Tag>
            <span style={{ color: 'var(--ant-color-text-tertiary, #8c8c8c)', fontSize: 13 }}>
              Итого:{' '}
              <strong style={{ color: 'var(--finance-income, #389e0d)' }}>
                {formatMoney(total)}
              </strong>
            </span>
          </Space>
        }
        extra={<CreateIncomeButton projectId={projectId} />}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap size="small">
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
              placeholder="Поиск по клиенту / назначению"
              style={{ width: 260 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Space>
          {filtered.length === 0 ? (
            <Empty description="Поступлений за выбранный период нет" />
          ) : (
            <Table<Income>
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={filtered}
              loading={isLoading}
              pagination={{ pageSize: 20, showSizeChanger: false }}
              scroll={{ x: 820 }}
              onRow={(record) => ({
                onClick: () => setEditTarget(record),
                style: { cursor: 'pointer' },
              })}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>Итого за период</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong style={{ color: 'var(--finance-income, #389e0d)' }}>
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

      <CreateIncomeButton
        projectId={projectId}
        income={editTarget}
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        hideTrigger
      />
    </>
  );
}
