'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { ProjectsOverview } from '@widgets/dashboard/projects-overview';
import { FinanceOverview } from '@widgets/dashboard/finance-overview';
import { PnlCard } from '@widgets/finance/pnl-card';
import { FinanceTimeseriesChart } from '@widgets/finance/timeseries-chart';
import { InsightsList } from '@widgets/ai-insights/insights-list';

export default function DashboardPage() {
  const { from, to } = useMemo(
    () => ({
      from: dayjs().subtract(30, 'day').startOf('day').toISOString(),
      to: dayjs().endOf('day').toISOString(),
    }),
    [],
  );

  return (
    <>
      <PageHeader title="Дашборд" subtitle="Сводная картина за последние 30 дней" />
      <PageContainer>
        <InsightsList title="Активные риски по объектам" canScan />
        <ProjectsOverview />
        <PnlCard from={from} to={to} />
        <FinanceTimeseriesChart from={from} to={to} title="Доходы и расходы за 30 дней" />
        <FinanceOverview />
      </PageContainer>
    </>
  );
}
