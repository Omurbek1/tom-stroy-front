'use client';

import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { PayrollTable } from '@widgets/payroll/payroll-table';
import { ClosedPayrollsTable } from '@widgets/payroll/closed-payrolls-table';

export default function PayrollPage() {
  return (
    <>
      <PageHeader title="Зарплаты" subtitle="Предпросмотр и закрытые ведомости" />
      <PageContainer>
        <PayrollTable />
        <ClosedPayrollsTable />
      </PageContainer>
    </>
  );
}
