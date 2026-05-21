'use client';

import { Button, DatePicker, Space, Tabs } from 'antd';
import { message } from '@shared/lib/antd-static';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { PageToolbar } from '@shared/ui/page-toolbar';
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

  const { from, to } = useMemo(
    () => ({
      from: range[0].startOf('day').toISOString(),
      to: range[1].endOf('day').toISOString(),
    }),
    [range],
  );

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

  const tabs = useMemo(
    () => [
      { key: 'incomes', label: 'Поступления', children: <IncomesTable /> },
      { key: 'expenses', label: 'Расходы', children: <ExpensesTable /> },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Финансы"
        subtitle="P&L, доходы и расходы по компании"
      />
      <PageToolbar
        dateRange={
          <DatePicker.RangePicker
            value={range}
            onChange={(v) => v && setRange(v as [Dayjs, Dayjs])}
            format="DD.MM.YYYY"
            allowClear={false}
          />
        }
        actions={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={onExport} loading={downloading}>
              P&L Excel
            </Button>
          </Space>
        }
      />
      <PageContainer>
        <PnlCard from={from} to={to} />
        <FinanceTimeseriesChart from={from} to={to} />
        <Tabs defaultActiveKey="incomes" items={tabs} />
      </PageContainer>
    </>
  );
}
