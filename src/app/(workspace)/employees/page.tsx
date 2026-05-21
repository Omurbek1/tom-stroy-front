'use client';

import { PageHeader } from '@shared/ui/page-header';
import { EmployeesTable } from '@widgets/employees/employees-table';

export default function EmployeesPage() {
  return (
    <>
      <PageHeader title="Сотрудники" subtitle="Состав и ставки" />
      <EmployeesTable />
    </>
  );
}
