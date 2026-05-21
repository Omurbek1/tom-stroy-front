'use client';

import { Space } from 'antd';
import { PageHeader } from '@shared/ui/page-header';
import { ProjectsOverview } from '@widgets/dashboard/projects-overview';
import { FinanceOverview } from '@widgets/dashboard/finance-overview';

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Дашборд" subtitle="Сводная картина по компании" />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <ProjectsOverview />
        <FinanceOverview />
      </Space>
    </>
  );
}
