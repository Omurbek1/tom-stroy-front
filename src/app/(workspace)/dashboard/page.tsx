'use client';

import { Space } from 'antd';
import dayjs from 'dayjs';
import { PageHeader } from '@shared/ui/page-header';
import { ProjectsOverview } from '@widgets/dashboard/projects-overview';
import { FinanceOverview } from '@widgets/dashboard/finance-overview';
import { PnlCard } from '@widgets/finance/pnl-card';
import { FinanceTimeseriesChart } from '@widgets/finance/timeseries-chart';

export default function DashboardPage() {
  const from = dayjs().subtract(30, 'day').startOf('day').toISOString();
  const to = dayjs().endOf('day').toISOString();

  return (
    <>
      <PageHeader title="Дашборд" subtitle="Сводная картина по компании за последние 30 дней" />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <ProjectsOverview />
        <PnlCard from={from} to={to} />
        <FinanceTimeseriesChart
          from={from}
          to={to}
          title="Доходы и расходы за 30 дней"
        />
        <FinanceOverview />
      </Space>
    </>
  );
}
