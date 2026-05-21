'use client';

import { use } from 'react';
import { Space } from 'antd';
import dayjs from 'dayjs';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { useProject } from '@entities/project/hooks';
import { PnlCard } from '@widgets/finance/pnl-card';
import { FinanceTimeseriesChart } from '@widgets/finance/timeseries-chart';
import { ExpensesTable } from '@widgets/finance/expenses-table';
import { IncomesTable } from '@widgets/finance/incomes-table';
import { ExportPnlButton } from '@features/export-pnl/ui/export-pnl-button';

export default function ObjectFinancePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);

  const from = (project?.startDate ? dayjs(project.startDate) : dayjs().subtract(90, 'day'))
    .startOf('day')
    .toISOString();
  const to = (project?.deadline ? dayjs(project.deadline) : dayjs()).endOf('day').toISOString();

  return (
    <>
      <PageMeta
        title="Финансы объекта"
        subtitle="P&L по конкретной стройке"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Финансы' },
        ]}
        actions={<ExportPnlButton from={from} to={to} projectId={id} />}
      />
      <PageContainer>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <PnlCard from={from} to={to} projectId={id} />
          <FinanceTimeseriesChart
            from={from}
            to={to}
            projectId={id}
            title="Доходы и расходы объекта"
          />
          <IncomesTable projectId={id} />
          <ExpensesTable projectId={id} />
        </Space>
      </PageContainer>
    </>
  );
}
