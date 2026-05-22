'use client';

import { use, useMemo, useState } from 'react';
import { Space } from 'antd';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { PageToolbar } from '@shared/ui/page-toolbar';
import { useProject } from '@entities/project/hooks';
import { FinanceHero } from '@widgets/finance/object-finance/finance-hero';
import { BudgetBurndown } from '@widgets/finance/object-finance/budget-burndown';
import { PnlWaterfall } from '@widgets/finance/object-finance/pnl-waterfall';
import {
  FinancePeriodPicker,
  computePeriod,
  type PeriodRange,
} from '@widgets/finance/object-finance/period-picker';
import { FinanceTimeseriesChart } from '@widgets/finance/timeseries-chart';
import { FinanceBreakdownWidget } from '@widgets/finance/finance-breakdown';
import { FinanceOperationsWidget } from '@widgets/finance/finance-operations';
import { ExpensesTable } from '@widgets/finance/expenses-table';
import { IncomesTable } from '@widgets/finance/incomes-table';
import { ExportPnlButton } from '@features/export-pnl/ui/export-pnl-button';

export default function ObjectFinancePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);

  const initial = useMemo(
    () => computePeriod('all', project?.startDate, project?.deadline),
    [project?.startDate, project?.deadline],
  );
  const [period, setPeriod] = useState<PeriodRange>(initial);

  return (
    <>
      <PageMeta
        title="Финансы объекта"
        subtitle="Бюджет, себестоимость и прибыль по конкретной стройке"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Финансы' },
        ]}
      />
      <PageToolbar
        actions={
          <Space wrap>
            <FinancePeriodPicker
              value={period}
              onChange={setPeriod}
              startDate={project?.startDate}
              deadline={project?.deadline}
            />
            <ExportPnlButton from={period.from} to={period.to} projectId={id} />
          </Space>
        }
      />
      <PageContainer>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 1. Executive KPI strip — 4 tiles, plain Russian, hover hints */}
          <FinanceHero projectId={id} from={period.from} to={period.to} />

          {/* 2. Budget burn-down — one-glance "are we still in the green?" */}
          <BudgetBurndown projectId={id} from={period.from} to={period.to} />

          {/* 3. P&L waterfall — how revenue becomes profit, step by step */}
          <PnlWaterfall projectId={id} from={period.from} to={period.to} />

          {/* 4. Cash-flow over time */}
          <div className="ofx-section-title">Динамика по дням</div>
          <FinanceTimeseriesChart
            from={period.from}
            to={period.to}
            projectId={id}
            title="Доходы и расходы объекта"
          />

          {/* 5. Drill-down — by brigade / material / category */}
          <div className="ofx-section-title">Детализация затрат</div>
          <FinanceBreakdownWidget from={period.from} to={period.to} projectId={id} />

          {/* 6. Operations + payables/receivables */}
          <div className="ofx-section-title">Денежные операции и задолженность</div>
          <FinanceOperationsWidget from={period.from} to={period.to} projectId={id} />

          {/* 7. Ledgers */}
          <div className="ofx-section-title">Поступления и платежи</div>
          <IncomesTable projectId={id} />
          <ExpensesTable projectId={id} />
        </Space>
      </PageContainer>
    </>
  );
}
