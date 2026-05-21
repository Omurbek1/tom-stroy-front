'use client';

import { DatePicker, Space, Tabs } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PnlCard } from '@widgets/finance/pnl-card';
import { ExpensesTable } from '@widgets/finance/expenses-table';
import { IncomesTable } from '@widgets/finance/incomes-table';
import { FinanceTimeseriesChart } from '@widgets/finance/timeseries-chart';

export default function FinancePage() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  const from = range[0].startOf('day').toISOString();
  const to = range[1].endOf('day').toISOString();

  return (
    <>
      <PageHeader
        title="Финансы"
        subtitle="P&L, доходы и расходы по компании"
        extra={
          <DatePicker.RangePicker
            value={range}
            onChange={(v) => v && setRange(v as [Dayjs, Dayjs])}
            format="DD.MM.YYYY"
            allowClear={false}
          />
        }
      />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <PnlCard from={from} to={to} />
        <FinanceTimeseriesChart from={from} to={to} />
        <Tabs
          defaultActiveKey="incomes"
          items={[
            { key: 'incomes', label: 'Поступления', children: <IncomesTable /> },
            { key: 'expenses', label: 'Расходы', children: <ExpensesTable /> },
          ]}
        />
      </Space>
    </>
  );
}
