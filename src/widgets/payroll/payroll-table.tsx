'use client';

import { Card, DatePicker, Space, Statistic, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { usePayrollPreview } from '@entities/payroll/hooks';
import type { PayrollPreviewRow, PayType } from '@entities/payroll/types';
import { formatMoney, formatNumber } from '@shared/lib/format';

const PAY_TYPE_LABEL: Record<PayType, string> = {
  PER_CUBE: 'За куб',
  PER_SQM: 'За м²',
  PER_METER: 'За м',
  PER_SHIFT: 'За смену',
  HOURLY: 'Почасовая',
  SALARY: 'Оклад',
  SALARY_PLUS_PERCENT: 'Оклад + %',
};

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

export function PayrollTable() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  const { data, isLoading } = usePayrollPreview({
    from: range[0].startOf('day').toISOString(),
    to: range[1].endOf('day').toISOString(),
  });

  const totalAccrued = (data ?? []).reduce((s, r) => s + Number(r.worksAccrued), 0);
  const totalHours = (data ?? []).reduce((s, r) => s + Number(r.hoursWorked), 0);

  return (
    <Card
      title="Ведомость (предпросмотр)"
      extra={
        <DatePicker.RangePicker
          value={range}
          onChange={(v) => v && setRange(v as [Dayjs, Dayjs])}
          format="DD.MM.YYYY"
          allowClear={false}
        />
      }
    >
      <Space size="large" style={{ marginBottom: 16 }}>
        <Statistic title="К начислению" value={formatMoney(totalAccrued)} />
        <Statistic title="Всего часов" value={formatNumber(totalHours)} />
        <Statistic title="Сотрудников" value={data?.length ?? 0} />
      </Space>
      <Table<PayrollPreviewRow>
        rowKey="employeeId"
        size="small"
        columns={columns}
        dataSource={data ?? []}
        loading={isLoading}
        pagination={false}
        sticky
      />
    </Card>
  );
}
