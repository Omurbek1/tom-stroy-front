'use client';

import { Space } from 'antd';
import { PageHeader } from '@shared/ui/page-header';
import { PayrollTable } from '@widgets/payroll/payroll-table';
import { ClosedPayrollsTable } from '@widgets/payroll/closed-payrolls-table';

export default function PayrollPage() {
  return (
    <>
      <PageHeader
        title="Зарплаты"
        subtitle="Предпросмотр и закрытые ведомости"
      />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <PayrollTable />
        <ClosedPayrollsTable />
      </Space>
    </>
  );
}
