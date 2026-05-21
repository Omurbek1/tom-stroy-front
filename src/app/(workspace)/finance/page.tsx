'use client';

import { Button, DatePicker, Space, Tabs, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PnlCard } from '@widgets/finance/pnl-card';
import { ExpensesTable } from '@widgets/finance/expenses-table';
import { IncomesTable } from '@widgets/finance/incomes-table';
import { FinanceTimeseriesChart } from '@widgets/finance/timeseries-chart';
import { downloadFile } from '@shared/lib/download';
import { apiRoutes } from '@shared/api/routes';

export default function FinancePage() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [downloading, setDownloading] = useState(false);

  const from = range[0].startOf('day').toISOString();
  const to = range[1].endOf('day').toISOString();

  const onExport = async () => {
    setDownloading(true);
    try {
      await downloadFile(apiRoutes.reports.pnlXlsx, { from, to }, 'pnl.xlsx');
    } catch {
      message.error('Не удалось скачать файл');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Финансы"
        subtitle="P&L, доходы и расходы по компании"
        extra={
          <Space>
            <DatePicker.RangePicker
              value={range}
              onChange={(v) => v && setRange(v as [Dayjs, Dayjs])}
              format="DD.MM.YYYY"
              allowClear={false}
            />
            <Button icon={<DownloadOutlined />} onClick={onExport} loading={downloading}>
              P&L Excel
            </Button>
          </Space>
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
