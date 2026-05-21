'use client';

import { Card, Space, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PayrollPreviewRow, PayType } from '@entities/payroll/types';
import { formatMoney, formatNumber } from '@shared/lib/format';
import { PAY_TYPE_LABEL } from '@shared/constants/employee-roles';

const columns: ColumnsType<PayrollPreviewRow> = [
  { title: 'Сотрудник', dataIndex: 'fullName', key: 'fullName' },
  {
    title: 'Тип оплаты',
    dataIndex: 'payType',
    key: 'payType',
    render: (t: PayType) => <Tag>{PAY_TYPE_LABEL[t] ?? t}</Tag>,
  },
  {
    title: 'Дни на работе',
    dataIndex: 'daysPresent',
    key: 'daysPresent',
    align: 'right',
    width: 140,
  },
  {
    title: 'Часов',
    dataIndex: 'hoursWorked',
    key: 'hoursWorked',
    align: 'right',
    width: 120,
    render: (v: number) => formatNumber(v),
  },
  {
    title: 'Начислено',
    dataIndex: 'worksAccrued',
    key: 'worksAccrued',
    align: 'right',
    width: 180,
    render: (v: number) => <strong>{formatMoney(v)}</strong>,
  },
];

interface Props {
  rows: PayrollPreviewRow[];
  isLoading: boolean;
}

export function PayrollTable({ rows, isLoading }: Props) {
  const totalAccrued = rows.reduce((s, r) => s + Number(r.worksAccrued), 0);
  const totalHours = rows.reduce((s, r) => s + Number(r.hoursWorked), 0);

  return (
    <Card title="Ведомость (предпросмотр)">
      <Space size="large" style={{ marginBottom: 16 }}>
        <Statistic title="К начислению" value={formatMoney(totalAccrued)} />
        <Statistic title="Всего часов" value={formatNumber(totalHours)} />
        <Statistic title="Сотрудников" value={rows.length} />
      </Space>
      <Table<PayrollPreviewRow>
        rowKey="employeeId"
        size="small"
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        pagination={false}
        sticky
      />
    </Card>
  );
}
