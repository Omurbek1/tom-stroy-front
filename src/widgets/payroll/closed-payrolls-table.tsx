'use client';

import { Card, Progress, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useClosedPayrolls } from '@entities/payroll/hooks';
import type { Payroll } from '@entities/payroll/types';
import { formatDate, formatMoney } from '@shared/lib/format';
import { PayrollDetailDrawer } from './payroll-detail-drawer';

const STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  approved: 'blue',
  paid: 'green',
  closed: 'default',
};

function netToPay(p: Payroll): number {
  return (
    Number(p.accrued) -
    Number(p.advance) -
    Number(p.fines) +
    Number(p.bonus) -
    Number(p.deductions)
  );
}

const columns: ColumnsType<Payroll> = [
  {
    title: 'Период',
    key: 'period',
    render: (_, r) => `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}`,
  },
  {
    title: 'Сотрудник',
    key: 'employee',
    render: (_, r) => r.employee?.fullName ?? '—',
  },
  {
    title: 'Начислено',
    dataIndex: 'accrued',
    key: 'accrued',
    align: 'right',
    render: (v: number) => formatMoney(v),
  },
  {
    title: 'Аванс',
    dataIndex: 'advance',
    key: 'advance',
    align: 'right',
    render: (v: number) => formatMoney(v),
  },
  {
    title: 'Штрафы',
    dataIndex: 'fines',
    key: 'fines',
    align: 'right',
    render: (v: number) => formatMoney(v),
  },
  {
    title: 'Премия',
    dataIndex: 'bonus',
    key: 'bonus',
    align: 'right',
    render: (v: number) => formatMoney(v),
  },
  {
    title: 'К выплате',
    key: 'net',
    align: 'right',
    render: (_, r) => <strong>{formatMoney(netToPay(r))}</strong>,
  },
  {
    title: 'Выплачено',
    key: 'paid',
    render: (_, r) => {
      const net = netToPay(r);
      const paid = Number(r.paid);
      const pct = net > 0 ? Math.min(100, (paid / net) * 100) : 0;
      return (
        <Space direction="vertical" style={{ width: 140 }} size={2}>
          <span style={{ fontSize: 'var(--font-size-xs)', lineHeight: 'var(--line-height-xs)' }}>
            {formatMoney(paid)}
          </span>
          <Progress percent={Math.round(pct)} size="small" />
        </Space>
      );
    },
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (s: string) => <Tag color={STATUS_COLOR[s] ?? 'default'}>{s}</Tag>,
  },
];

export function ClosedPayrollsTable() {
  const { data, isLoading } = useClosedPayrolls({ limit: 100 });
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Card title="Закрытые ведомости">
      <Table<Payroll>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        pagination={false}
        scroll={{ x: 1000 }}
        onRow={(record) => ({
          onClick: () => setOpenId(record.id),
          style: { cursor: 'pointer' },
        })}
      />
      <PayrollDetailDrawer
        payrollId={openId}
        open={openId !== null}
        onClose={() => setOpenId(null)}
      />
    </Card>
  );
}
