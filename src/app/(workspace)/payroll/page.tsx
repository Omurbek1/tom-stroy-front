'use client';

import { PageHeader } from '@shared/ui/page-header';
import { PayrollTable } from '@widgets/payroll/payroll-table';

export default function PayrollPage() {
  return (
    <>
      <PageHeader
        title="Зарплаты"
        subtitle="Накопленные суммы за период по данным отчётов прорабов"
      />
      <PayrollTable />
    </>
  );
}
