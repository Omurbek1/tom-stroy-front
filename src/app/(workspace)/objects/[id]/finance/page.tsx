'use client';

import { use, useMemo, useState } from 'react';
import { Card, Space, Tabs } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
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
          <FinanceHero projectId={id} from={period.from} to={period.to} />
          <BudgetBurndown projectId={id} from={period.from} to={period.to} />
          <PnlWaterfall projectId={id} from={period.from} to={period.to} />

          <div className="ofx-section-title">Динамика</div>
          <FinanceTimeseriesChart
            from={period.from}
            to={period.to}
            projectId={id}
            title="Доходы и расходы объекта"
          />

          <div className="ofx-section-title">Детализация затрат</div>
          <FinanceBreakdownWidget from={period.from} to={period.to} projectId={id} />

          <div className="ofx-section-title">Долги и зарплата</div>
          <FinanceOperationsWidget from={period.from} to={period.to} projectId={id} />

          <div className="ofx-section-title">Реестр операций</div>
          <Card styles={{ body: { padding: 0 } }}>
            <Tabs
              defaultActiveKey="incomes"
              tabBarStyle={{ padding: '0 16px', marginBottom: 0 }}
              items={[
                {
                  key: 'incomes',
                  label: (
                    <span>
                      <ArrowUpOutlined style={{ color: 'var(--finance-income, #389e0d)' }} />{' '}
                      Поступления
                    </span>
                  ),
                  children: (
                    <div style={{ padding: 16 }}>
                      <IncomesTable projectId={id} />
                    </div>
                  ),
                },
                {
                  key: 'expenses',
                  label: (
                    <span>
                      <ArrowDownOutlined style={{ color: 'var(--finance-expense, #cf1322)' }} />{' '}
                      Расходы
                    </span>
                  ),
                  children: (
                    <div style={{ padding: 16 }}>
                      <ExpensesTable projectId={id} />
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Space>
      </PageContainer>
    </>
  );
}
